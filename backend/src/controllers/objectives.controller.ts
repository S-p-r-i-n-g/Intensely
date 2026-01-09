import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export class ObjectivesController {
  /**
   * GET /api/objectives
   * Get all workout objectives
   */
  static async listObjectives(req: Request, res: Response): Promise<void> {
    try {
      const objectives = await prisma.workoutObjective.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: 'asc' }
      });

      res.json({ data: objectives });
    } catch (error) {
      console.error('Error fetching objectives:', error);
      res.status(500).json({
        error: 'Failed to fetch objectives',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/objectives/:id
   * Get a single workout objective by ID
   */
  static async getObjective(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const objective = await prisma.workoutObjective.findUnique({
        where: { id }
      });

      if (!objective) {
        res.status(404).json({
          error: 'Objective not found',
          message: `No objective found with ID: ${id}`
        });
        return;
      }

      res.json({ data: objective });
    } catch (error) {
      console.error('Error fetching objective:', error);
      res.status(500).json({
        error: 'Failed to fetch objective',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/objectives/by-slug/:slug
   * Get a single workout objective by slug
   */
  static async getObjectiveBySlug(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;

      const objective = await prisma.workoutObjective.findUnique({
        where: { slug }
      });

      if (!objective) {
        res.status(404).json({
          error: 'Objective not found',
          message: `No objective found with slug: ${slug}`
        });
        return;
      }

      res.json({ data: objective });
    } catch (error) {
      console.error('Error fetching objective:', error);
      res.status(500).json({
        error: 'Failed to fetch objective',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
