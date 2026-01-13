import { Router } from 'express';
import { ObjectivesController } from '../controllers/objectives.controller';

const router = Router();

// GET /api/objectives - List all workout objectives
router.get('/', ObjectivesController.listObjectives);

// GET /api/objectives/by-slug/:slug - Get objective by slug
router.get('/by-slug/:slug', ObjectivesController.getObjectiveBySlug);

// GET /api/objectives/:id - Get single objective by ID
router.get('/:id', ObjectivesController.getObjective);

export default router;
