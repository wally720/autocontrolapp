from playwright.sync_api import sync_playwright

def run_cuj(page):
    # Navigate to the app
    page.goto("http://localhost:5173/autocontrolapp/")  # Vite default port with base path
    page.wait_for_timeout(2000) # wait for firebase auth/loading

    # Enter email
    email_input = page.get_by_placeholder("correo@ejemplo.com")
    if email_input.is_visible():
        email_input.fill("test@example.com")
        page.wait_for_timeout(500)

        # Enter password
        password_input = page.get_by_placeholder("Tu contraseña")
        password_input.fill("password123")
        page.wait_for_timeout(500)

        # Click login
        page.get_by_role("button", name="Iniciar Sesión").click()
        page.wait_for_timeout(3000) # wait for login and data load

    # Navigate to Reports (Reportes)
    reports_link = page.get_by_text("Reportes")
    if reports_link.is_visible():
        reports_link.click()
        page.wait_for_timeout(2000)

    # The MonthlyComparison component should be visible on the Reports page.
    # We will look for "Comparativa Mes a Mes" text and the cards
    page.get_by_text("Comparativa Mes a Mes").wait_for(state="visible", timeout=5000)
    page.wait_for_timeout(1000)

    # Take screenshot at the key moment (showing the MonthlyComparison component)
    page.screenshot(path="/home/jules/verification/screenshots/verification.png")
    page.wait_for_timeout(1000)  # Hold final state for the video

if __name__ == "__main__":
    import os
    os.makedirs("/home/jules/verification/videos", exist_ok=True)
    os.makedirs("/home/jules/verification/screenshots", exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos",
            viewport={"width": 1280, "height": 720}
        )
        page = context.new_page()
        try:
            run_cuj(page)
        except Exception as e:
            print(f"Error during execution: {e}")
            page.screenshot(path="/home/jules/verification/screenshots/error.png")
        finally:
            context.close()  # MUST close context to save the video
            browser.close()
