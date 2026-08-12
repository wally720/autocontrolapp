// src/utils/categoryIcons.jsx
import {
  FaGasPump, FaWrench, FaFileContract, FaUniversity, FaShower,
  FaParking, FaRoad, FaDotCircle, FaQuestionCircle
} from 'react-icons/fa';
import { CATEGORIES } from './constants';

/**
 * Mapeo centralizado de iconos por categoría de gasto.
 * Esto elimina la duplicación en ExpenseHistory y ExpenseDetail.
 */
export const categoryIcons = {
  [CATEGORIES.FUEL]: <FaGasPump />,
  [CATEGORIES.MAINTENANCE]: <FaWrench />,
  [CATEGORIES.INSURANCE]: <FaFileContract />,
  [CATEGORIES.TAXES]: <FaUniversity />,
  [CATEGORIES.WASH]: <FaShower />,
  [CATEGORIES.PARKING]: <FaParking />,
  [CATEGORIES.TOLLS]: <FaRoad />,
  [CATEGORIES.TIRES]: <FaDotCircle />,
  [CATEGORIES.OTHER]: <FaQuestionCircle />,
};
