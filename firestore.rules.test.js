/**
 * Tests de las reglas de seguridad de Firestore.
 *
 * Corren contra el emulador: `npm run test:rules`.
 *
 * Esta suite describe lo que las reglas hacen HOY, no lo que deberian hacer.
 * Los casos marcados como HUECO documentan vulnerabilidades abiertas y por eso
 * afirman el comportamiento inseguro: la suite queda en verde y sirve como
 * inventario. Al cerrar cada hueco se invierte su assert.
 *
 * Referencia completa: docs/seguridad/firestore-rules-hallazgos.md
 */

import { readFileSync } from 'node:fs';
import { after, before, describe, it } from 'node:test';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc, getDocs, collection, query, where } from 'firebase/firestore';

const ALICE = 'uid_alice';
const BOB = 'uid_bob';
const ADMIN = 'uid_admin';

const ALICE_EMAIL = 'alice@example.com';
const BOB_EMAIL = 'bob@example.com';
const ADMIN_EMAIL = 'admin@example.com';

const PLATE = 'ABC123';
const OTHER_PLATE = 'XYZ789';

let testEnv;

/** Perfil tal como lo escribe AuthContext.jsx en el primer login. */
const newProfile = (email, overrides = {}) => ({
  email,
  status: 'approved',
  role: 'user',
  vehicles: [],
  createdAt: new Date().toISOString(),
  ...overrides,
});

/** Contexto autenticado con el email en el token, como hace Google. */
const asUser = (uid, email) => testEnv.authenticatedContext(uid, { email });

before(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'gastos-auto-test',
    firestore: {
      rules: readFileSync('firestore.rules', 'utf8'),
      host: '127.0.0.1',
      port: 8080,
    },
  });
});

after(async () => {
  await testEnv?.cleanup();
});

/** Siembra datos saltando las reglas. */
const seed = async (fn) => {
  await testEnv.clearFirestore();
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await fn(ctx.firestore());
  });
};

const seedBaseline = () =>
  seed(async (db) => {
    await setDoc(doc(db, 'users', ALICE), newProfile(ALICE_EMAIL, { status: 'approved', vehicles: [PLATE] }));
    await setDoc(doc(db, 'users', BOB), newProfile(BOB_EMAIL, { status: 'approved' }));
    await setDoc(doc(db, 'users', ADMIN), newProfile(ADMIN_EMAIL, { status: 'approved', role: 'admin' }));

    await setDoc(doc(db, 'vehicles', PLATE), {
      plate: PLATE,
      ownerId: ALICE,
      authorizedUsers: [ALICE],
      createdAt: new Date().toISOString(),
    });

    await setDoc(doc(db, 'expenses', 'exp_alice'), {
      vehicleId: PLATE,
      userId: ALICE,
      date: '2026-01-01',
      amount: 100,
    });
  });

// ---------------------------------------------------------------------------
// users
// ---------------------------------------------------------------------------

describe('users', () => {
  it('un usuario lee su propio perfil', async () => {
    await seedBaseline();
    const db = asUser(ALICE, ALICE_EMAIL).firestore();
    await assertSucceeds(getDoc(doc(db, 'users', ALICE)));
  });

  it('un usuario NO lee el perfil de otro', async () => {
    await seedBaseline();
    const db = asUser(BOB, BOB_EMAIL).firestore();
    await assertFails(getDoc(doc(db, 'users', ALICE)));
  });

  it('un admin lee el perfil de otro', async () => {
    await seedBaseline();
    const db = asUser(ADMIN, ADMIN_EMAIL).firestore();
    await assertSucceeds(getDoc(doc(db, 'users', ALICE)));
  });

  it('el alta real de AuthContext funciona', async () => {
    await seed(async () => {});
    const db = asUser(ALICE, ALICE_EMAIL).firestore();
    await assertSucceeds(setDoc(doc(db, 'users', ALICE), newProfile(ALICE_EMAIL)));
  });

  it('C1 cerrado: no puede autoasignarse role admin al crearse', async () => {
    await seed(async () => {});
    const db = asUser(ALICE, ALICE_EMAIL).firestore();
    await assertFails(
      setDoc(doc(db, 'users', ALICE), newProfile(ALICE_EMAIL, { role: 'admin', status: 'approved' })),
    );
  });

  it('C1 cerrado: no puede crearse con el email de otro', async () => {
    await seed(async () => {});
    const db = asUser(ALICE, ALICE_EMAIL).firestore();
    await assertFails(setDoc(doc(db, 'users', ALICE), newProfile(BOB_EMAIL)));
  });

  it('no puede crear el perfil de otro usuario', async () => {
    await seed(async () => {});
    const db = asUser(ALICE, ALICE_EMAIL).firestore();
    await assertFails(setDoc(doc(db, 'users', BOB), newProfile(BOB_EMAIL)));
  });

  it('campos cosmeticos extra no rompen el alta', async () => {
    await seed(async () => {});
    const db = asUser(ALICE, ALICE_EMAIL).firestore();
    await assertSucceeds(
      setDoc(doc(db, 'users', ALICE), newProfile(ALICE_EMAIL, { displayName: 'Alice', photoURL: 'https://x/y.png' })),
    );
  });

  it('no puede promoverse a admin por update', async () => {
    await seedBaseline();
    const db = asUser(ALICE, ALICE_EMAIL).firestore();
    await assertFails(updateDoc(doc(db, 'users', ALICE), { role: 'admin' }));
  });

  it('no puede aprobarse a si mismo por update', async () => {
    // Bob arranca pending a proposito: si ya estuviera approved, diff() daria
    // un set vacio y hasOnly() lo aceptaria por no haber cambio real.
    await seed(async (db) => {
      await setDoc(doc(db, 'users', BOB), newProfile(BOB_EMAIL, { status: 'pending' }));
    });
    const db = asUser(BOB, BOB_EMAIL).firestore();
    await assertFails(updateDoc(doc(db, 'users', BOB), { status: 'approved' }));
  });

  it('puede actualizar su propio array de vehicles', async () => {
    await seedBaseline();
    const db = asUser(ALICE, ALICE_EMAIL).firestore();
    await assertSucceeds(updateDoc(doc(db, 'users', ALICE), { vehicles: [PLATE, OTHER_PLATE] }));
  });

  it('un admin cambia el status de otro', async () => {
    await seedBaseline();
    const db = asUser(ADMIN, ADMIN_EMAIL).firestore();
    await assertSucceeds(updateDoc(doc(db, 'users', BOB), { status: 'blocked' }));
  });

  it('nadie puede borrar perfiles', async () => {
    await seedBaseline();
    const db = asUser(ADMIN, ADMIN_EMAIL).firestore();
    const { deleteDoc } = await import('firebase/firestore');
    await assertFails(deleteDoc(doc(db, 'users', BOB)));
  });

  it('M3 residual: puede agregarse placas ajenas a su array vehicles', async () => {
    // Sin impacto en el acceso a datos: se resuelve contra authorizedUsers.
    await seedBaseline();
    const db = asUser(BOB, BOB_EMAIL).firestore();
    await assertSucceeds(updateDoc(doc(db, 'users', BOB), { vehicles: [PLATE] }));
  });

  it('M3: el array vehicles tiene tope anti-abuso', async () => {
    await seedBaseline();
    const db = asUser(BOB, BOB_EMAIL).firestore();
    const muchas = Array.from({ length: 21 }, (_, i) => `PLACA${i}`);
    await assertFails(updateDoc(doc(db, 'users', BOB), { vehicles: muchas }));
  });
});

// ---------------------------------------------------------------------------
// vehicles
// ---------------------------------------------------------------------------

describe('vehicles', () => {
  it('el alta real de VehicleSwitcher funciona', async () => {
    await seedBaseline();
    const db = asUser(BOB, BOB_EMAIL).firestore();
    await assertSucceeds(
      setDoc(doc(db, 'vehicles', OTHER_PLATE), {
        plate: OTHER_PLATE,
        ownerId: BOB,
        authorizedUsers: [BOB],
        createdAt: new Date().toISOString(),
      }),
    );
  });

  it('el dueño modifica authorizedUsers', async () => {
    await seedBaseline();
    const db = asUser(ALICE, ALICE_EMAIL).firestore();
    await assertSucceeds(updateDoc(doc(db, 'vehicles', PLATE), { authorizedUsers: [ALICE, BOB] }));
  });

  it('un tercero NO modifica authorizedUsers', async () => {
    await seedBaseline();
    const db = asUser(BOB, BOB_EMAIL).firestore();
    await assertFails(updateDoc(doc(db, 'vehicles', PLATE), { authorizedUsers: [ALICE, BOB] }));
  });

  it('un admin modifica authorizedUsers', async () => {
    await seedBaseline();
    const db = asUser(ADMIN, ADMIN_EMAIL).firestore();
    await assertSucceeds(updateDoc(doc(db, 'vehicles', PLATE), { authorizedUsers: [ALICE, BOB] }));
  });

  it('A1: get puntual sigue permitido -- VehicleSwitcher lo necesita', async () => {
    await seedBaseline();
    const db = asUser(BOB, BOB_EMAIL).firestore();
    await assertSucceeds(getDoc(doc(db, 'vehicles', PLATE)));
  });

  it('A1 cerrado: un usuario comun NO enumera la flota', async () => {
    await seedBaseline();
    const db = asUser(BOB, BOB_EMAIL).firestore();
    await assertFails(getDocs(collection(db, 'vehicles')));
  });

  it('A1: el admin sigue enumerando la flota -- AdminDashboard lo necesita', async () => {
    await seedBaseline();
    const db = asUser(ADMIN, ADMIN_EMAIL).firestore();
    await assertSucceeds(getDocs(collection(db, 'vehicles')));
  });

  it('C3 cerrado: no puede crear una placa poniendo a otro como ownerId', async () => {
    await seedBaseline();
    const db = asUser(BOB, BOB_EMAIL).firestore();
    await assertFails(
      setDoc(doc(db, 'vehicles', OTHER_PLATE), {
        plate: OTHER_PLATE,
        ownerId: ALICE,
        authorizedUsers: [BOB],
        createdAt: new Date().toISOString(),
      }),
    );
  });

  it('C3 cerrado: no puede autoinyectarse en authorizedUsers al crear', async () => {
    await seedBaseline();
    const db = asUser(BOB, BOB_EMAIL).firestore();
    await assertFails(
      setDoc(doc(db, 'vehicles', OTHER_PLATE), {
        plate: OTHER_PLATE,
        ownerId: BOB,
        authorizedUsers: [BOB, ALICE],
        createdAt: new Date().toISOString(),
      }),
    );
  });

  it('C3 residual: reservar una placa ajena sigue siendo posible', async () => {
    await seedBaseline();
    const attacker = asUser(BOB, BOB_EMAIL).firestore();
    await assertSucceeds(
      setDoc(doc(attacker, 'vehicles', OTHER_PLATE), {
        plate: OTHER_PLATE,
        ownerId: BOB,
        authorizedUsers: [BOB],
        createdAt: new Date().toISOString(),
      }),
    );
    // El dueño legitimo ya no puede registrarla: create solo aplica si no existe.
    const victim = asUser(ALICE, ALICE_EMAIL).firestore();
    await assertFails(
      setDoc(doc(victim, 'vehicles', OTHER_PLATE), {
        plate: OTHER_PLATE,
        ownerId: ALICE,
        authorizedUsers: [ALICE],
        createdAt: new Date().toISOString(),
      }),
    );
  });
});

// ---------------------------------------------------------------------------
// expenses
// ---------------------------------------------------------------------------

describe('expenses', () => {
  it('un usuario autorizado lee los gastos del vehiculo', async () => {
    await seedBaseline();
    const db = asUser(ALICE, ALICE_EMAIL).firestore();
    await assertSucceeds(
      getDocs(query(collection(db, 'expenses'), where('vehicleId', '==', PLATE))),
    );
  });

  it('un usuario NO autorizado no lee los gastos del vehiculo', async () => {
    await seedBaseline();
    const db = asUser(BOB, BOB_EMAIL).firestore();
    await assertFails(
      getDocs(query(collection(db, 'expenses'), where('vehicleId', '==', PLATE))),
    );
  });

  it('un usuario autorizado crea un gasto', async () => {
    await seedBaseline();
    const db = asUser(ALICE, ALICE_EMAIL).firestore();
    const { addDoc } = await import('firebase/firestore');
    await assertSucceeds(
      addDoc(collection(db, 'expenses'), { vehicleId: PLATE, userId: ALICE, date: '2026-02-01', amount: 50 }),
    );
  });

  it('no puede crear un gasto en un vehiculo ajeno', async () => {
    await seedBaseline();
    const db = asUser(BOB, BOB_EMAIL).firestore();
    const { addDoc } = await import('firebase/firestore');
    await assertFails(
      addDoc(collection(db, 'expenses'), { vehicleId: PLATE, userId: BOB, date: '2026-02-01', amount: 50 }),
    );
  });

  it('no puede crear un gasto a nombre de otro', async () => {
    await seedBaseline();
    const db = asUser(ALICE, ALICE_EMAIL).firestore();
    const { addDoc } = await import('firebase/firestore');
    await assertFails(
      addDoc(collection(db, 'expenses'), { vehicleId: PLATE, userId: BOB, date: '2026-02-01', amount: 50 }),
    );
  });

  it('el creador borra su gasto', async () => {
    await seedBaseline();
    const db = asUser(ALICE, ALICE_EMAIL).firestore();
    const { deleteDoc } = await import('firebase/firestore');
    await assertSucceeds(deleteDoc(doc(db, 'expenses', 'exp_alice')));
  });

  it('un tercero no borra el gasto ajeno', async () => {
    await seedBaseline();
    const db = asUser(BOB, BOB_EMAIL).firestore();
    const { deleteDoc } = await import('firebase/firestore');
    await assertFails(deleteDoc(doc(db, 'expenses', 'exp_alice')));
  });

  it('M1 cerrado: un admin puede borrar gastos', async () => {
    await seedBaseline();
    const db = asUser(ADMIN, ADMIN_EMAIL).firestore();
    const { deleteDoc } = await import('firebase/firestore');
    await assertSucceeds(deleteDoc(doc(db, 'expenses', 'exp_alice')));
  });

  it('el creador edita el importe de su gasto', async () => {
    await seedBaseline();
    const db = asUser(ALICE, ALICE_EMAIL).firestore();
    await assertSucceeds(updateDoc(doc(db, 'expenses', 'exp_alice'), { amount: 250 }));
  });

  it('M2 cerrado: el creador NO puede mover su gasto a un vehiculo ajeno', async () => {
    await seed(async (db) => {
      await setDoc(doc(db, 'vehicles', PLATE), {
        plate: PLATE, ownerId: ALICE, authorizedUsers: [ALICE], createdAt: new Date().toISOString(),
      });
      await setDoc(doc(db, 'vehicles', OTHER_PLATE), {
        plate: OTHER_PLATE, ownerId: BOB, authorizedUsers: [BOB], createdAt: new Date().toISOString(),
      });
      await setDoc(doc(db, 'expenses', 'exp_alice'), {
        vehicleId: PLATE, userId: ALICE, date: '2026-01-01', amount: 100,
      });
    });
    const db = asUser(ALICE, ALICE_EMAIL).firestore();
    await assertFails(updateDoc(doc(db, 'expenses', 'exp_alice'), { vehicleId: OTHER_PLATE }));
  });

  it('M2 cerrado: no puede reasignar el gasto a otro usuario', async () => {
    await seedBaseline();
    const db = asUser(ALICE, ALICE_EMAIL).firestore();
    await assertFails(updateDoc(doc(db, 'expenses', 'exp_alice'), { userId: BOB }));
  });
});

// ---------------------------------------------------------------------------
// C2 -- status no gatea ningun dato
// ---------------------------------------------------------------------------

describe('status', () => {
  const seedPending = () =>
    seed(async (db) => {
      await setDoc(doc(db, 'users', BOB), newProfile(BOB_EMAIL, { status: 'pending' }));
      await setDoc(doc(db, 'vehicles', PLATE), {
        plate: PLATE, ownerId: BOB, authorizedUsers: [BOB], createdAt: new Date().toISOString(),
      });
    });

  const seedBlocked = () =>
    seed(async (db) => {
      await setDoc(doc(db, 'users', BOB), newProfile(BOB_EMAIL, { status: 'blocked' }));
      await setDoc(doc(db, 'vehicles', PLATE), {
        plate: PLATE, ownerId: BOB, authorizedUsers: [BOB], createdAt: new Date().toISOString(),
      });
      await setDoc(doc(db, 'expenses', 'exp_bob'), {
        vehicleId: PLATE, userId: BOB, date: '2026-01-01', amount: 100,
      });
    });

  it('un usuario pending sigue accediendo a datos -- la barrera es de UI', async () => {
    await seedPending();
    const db = asUser(BOB, BOB_EMAIL).firestore();
    await assertSucceeds(getDoc(doc(db, 'vehicles', PLATE)));
  });

  it('C2 cerrado: un usuario blocked NO lee vehiculos', async () => {
    await seedBlocked();
    const db = asUser(BOB, BOB_EMAIL).firestore();
    await assertFails(getDoc(doc(db, 'vehicles', PLATE)));
  });

  it('C2 cerrado: un usuario blocked NO lee sus gastos', async () => {
    await seedBlocked();
    const db = asUser(BOB, BOB_EMAIL).firestore();
    await assertFails(
      getDocs(query(collection(db, 'expenses'), where('vehicleId', '==', PLATE))),
    );
  });

  it('C2 cerrado: un usuario blocked NO crea gastos', async () => {
    await seedBlocked();
    const db = asUser(BOB, BOB_EMAIL).firestore();
    const { addDoc } = await import('firebase/firestore');
    await assertFails(
      addDoc(collection(db, 'expenses'), { vehicleId: PLATE, userId: BOB, date: '2026-02-01', amount: 50 }),
    );
  });

  it('C2 cerrado: un usuario blocked NO borra sus gastos', async () => {
    await seedBlocked();
    const db = asUser(BOB, BOB_EMAIL).firestore();
    const { deleteDoc } = await import('firebase/firestore');
    await assertFails(deleteDoc(doc(db, 'expenses', 'exp_bob')));
  });

  it('C2 cerrado: un usuario blocked NO registra placas', async () => {
    await seedBlocked();
    const db = asUser(BOB, BOB_EMAIL).firestore();
    await assertFails(
      setDoc(doc(db, 'vehicles', OTHER_PLATE), {
        plate: OTHER_PLATE, ownerId: BOB, authorizedUsers: [BOB], createdAt: new Date().toISOString(),
      }),
    );
  });

  it('un usuario blocked SI lee su propio perfil -- la UI se lo tiene que decir', async () => {
    await seedBlocked();
    const db = asUser(BOB, BOB_EMAIL).firestore();
    await assertSucceeds(getDoc(doc(db, 'users', BOB)));
  });

  it('un perfil sin campo status se considera activo', async () => {
    await seed(async (db) => {
      await setDoc(doc(db, 'users', BOB), { email: BOB_EMAIL, role: 'user', vehicles: [] });
      await setDoc(doc(db, 'vehicles', PLATE), {
        plate: PLATE, ownerId: BOB, authorizedUsers: [BOB], createdAt: new Date().toISOString(),
      });
    });
    const db = asUser(BOB, BOB_EMAIL).firestore();
    await assertSucceeds(getDoc(doc(db, 'vehicles', PLATE)));
  });
});

// ---------------------------------------------------------------------------
// Deny por defecto
// ---------------------------------------------------------------------------

describe('deny por defecto', () => {
  it('sin autenticar no se lee nada', async () => {
    await seedBaseline();
    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(db, 'vehicles', PLATE)));
    await assertFails(getDoc(doc(db, 'users', ALICE)));
  });

  it('una coleccion no declarada esta denegada', async () => {
    await seedBaseline();
    const db = asUser(ALICE, ALICE_EMAIL).firestore();
    await assertFails(getDoc(doc(db, 'coleccion_inexistente', 'x')));
    await assertFails(setDoc(doc(db, 'coleccion_inexistente', 'x'), { a: 1 }));
  });
});
