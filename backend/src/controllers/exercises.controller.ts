import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export class ExercisesController {
  /**
   * GET /api/exercises
   * Browse exercises with optional filtering
   *
   * Query params:
   * - category: Filter by primary category (upper_body_push, lower_body, core, etc.)
   * - difficulty: Filter by difficulty (beginner, intermediate, advanced)
   * - hictSuitable: Filter for HICT suitable exercises (true/false)
   * - smallSpace: Filter for small space exercises (true/false)
   * - quiet: Filter for quiet exercises (true/false)
   * - equipment: Filter by equipment (comma-separated: bodyweight,dumbbell,etc.)
   * - search: Search by exercise name
   * - limit: Number of results (default 50, max 100)
   * - offset: Offset for pagination (default 0)
   */
  static async listExercises(req: Request, res: Response): Promise<void> {
    try {
      const {
        category,
        difficulty,
        hictSuitable,
        smallSpace,
        quiet,
        equipment,
        search,
        limit = '50',
        offset = '0'
      } = req.query;

      // Build where clause
      const where: any = {};

      if (category) {
        where.primaryCategory = category;
      }

      if (difficulty) {
        where.difficulty = difficulty;
      }

      if (hictSuitable !== undefined) {
        where.hictSuitable = hictSuitable === 'true';
      }

      if (smallSpace !== undefined) {
        where.smallSpace = smallSpace === 'true';
      }

      if (quiet !== undefined) {
        where.quiet = quiet === 'true';
      }

      if (equipment) {
        // Equipment is stored as JSON array, need to filter
        // For now, we'll fetch all and filter in memory
        // In production, consider using raw SQL for JSON array queries
      }

      if (search) {
        where.name = {
          contains: search as string,
          mode: 'insensitive'
        };
      }

      // Parse pagination
      const limitNum = Math.min(parseInt(limit as string) || 50, 100);
      const offsetNum = parseInt(offset as string) || 0;

      // Query exercises
      const [exercises, total] = await Promise.all([
        prisma.exercise.findMany({
          where,
          take: limitNum,
          skip: offsetNum,
          orderBy: { name: 'asc' }
        }),
        prisma.exercise.count({ where })
      ]);

      // Filter by equipment if specified (post-query filter)
      let filteredExercises = exercises;
      if (equipment) {
        const equipmentList = (equipment as string).split(',').map(e => e.trim());
        filteredExercises = exercises.filter(ex => {
          const exEquipment = ex.equipment as string[];
          return equipmentList.some(eq => exEquipment.includes(eq));
        });
      }

      res.json({
        data: filteredExercises,
        pagination: {
          total,
          limit: limitNum,
          offset: offsetNum,
          hasMore: offsetNum + limitNum < total
        }
      });
    } catch (error) {
      console.error('Error fetching exercises:', error);
      res.status(500).json({
        error: 'Failed to fetch exercises',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/exercises/:id
   * Get a single exercise by ID
   */
  static async getExercise(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const exercise = await prisma.exercise.findUnique({
        where: { id },
        include: {
          family: true // Include exercise family info
        }
      });

      if (!exercise) {
        res.status(404).json({
          error: 'Exercise not found',
          message: `No exercise found with ID: ${id}`
        });
        return;
      }

      res.json({ data: exercise });
    } catch (error) {
      console.error('Error fetching exercise:', error);
      res.status(500).json({
        error: 'Failed to fetch exercise',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/exercises/by-slug/:slug
   * Get a single exercise by slug
   */
  static async getExerciseBySlug(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;

      const exercise = await prisma.exercise.findUnique({
        where: { slug },
        include: {
          family: true
        }
      });

      if (!exercise) {
        res.status(404).json({
          error: 'Exercise not found',
          message: `No exercise found with slug: ${slug}`
        });
        return;
      }

      res.json({ data: exercise });
    } catch (error) {
      console.error('Error fetching exercise:', error);
      res.status(500).json({
        error: 'Failed to fetch exercise',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/exercises/categories
   * Get list of all exercise categories with counts
   */
  static async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const exercises = await prisma.exercise.findMany({
        select: { primaryCategory: true }
      });

      const categoryCounts: Record<string, number> = {};
      exercises.forEach(ex => {
        categoryCounts[ex.primaryCategory] = (categoryCounts[ex.primaryCategory] || 0) + 1;
      });

      const categories = Object.entries(categoryCounts).map(([name, count]) => ({
        name,
        count
      }));

      res.json({ data: categories });
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({
        error: 'Failed to fetch categories',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
