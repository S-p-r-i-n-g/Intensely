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
   * - isVerified: Filter for verified exercises (true/false)
   * - primaryMuscles: Filter by primary muscles (comma-separated: chest,triceps,etc.)
   * - familyName: Filter by exercise family name
   * - cardioIntensive: Filter for cardio intensive exercises (true/false)
   * - strengthFocus: Filter for strength focus exercises (true/false)
   * - mobilityFocus: Filter for mobility focus exercises (true/false)
   * - minimalTransition: Filter for minimal transition exercises (true/false)
   * - movementPattern: Filter by movement pattern (push, pull, squat, hinge, etc.)
   * - mechanic: Filter by mechanic (compound, isolation)
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
        isVerified,
        primaryMuscles,
        familyName,
        cardioIntensive,
        strengthFocus,
        mobilityFocus,
        minimalTransition,
        movementPattern,
        mechanic,
        limit = '50',
        offset = '0'
      } = req.query;

      // Build where clause
      const where: any = {
        deletedAt: null // Filter out soft-deleted items
      };

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

      if (isVerified !== undefined) {
        where.isVerified = isVerified === 'true';
      }

      if (cardioIntensive !== undefined) {
        where.cardioIntensive = cardioIntensive === 'true';
      }

      if (strengthFocus !== undefined) {
        where.strengthFocus = strengthFocus === 'true';
      }

      if (mobilityFocus !== undefined) {
        where.mobilityFocus = mobilityFocus === 'true';
      }

      if (minimalTransition !== undefined) {
        where.minimalTransition = minimalTransition === 'true';
      }

      if (movementPattern) {
        where.movementPattern = movementPattern;
      }

      if (mechanic) {
        where.mechanic = mechanic;
      }

      // Equipment filtering at database level using JSON array contains
      if (equipment) {
        const equipmentList = (equipment as string).split(',').map(e => e.trim());
        // For JSONB arrays, we need to check if ANY of the equipment items match
        // Using OR logic to check each equipment value
        where.OR = equipmentList.map(eq => ({
          equipment: {
            array_contains: [eq]
          }
        }));
      }

      // Primary muscles filtering at database level using JSON array contains
      if (primaryMuscles) {
        const musclesList = (primaryMuscles as string).split(',').map(m => m.trim());
        // For JSONB arrays, check if ANY of the muscle values match
        const muscleFilters = musclesList.map(muscle => ({
          primaryMuscles: {
            array_contains: [muscle]
          }
        }));
        // Combine with existing OR filters if equipment is also specified
        if (where.OR) {
          where.AND = [
            { OR: where.OR },
            { OR: muscleFilters }
          ];
          delete where.OR;
        } else {
          where.OR = muscleFilters;
        }
      }

      // Family name filtering via ExerciseFamily relation
      if (familyName) {
        where.family = {
          name: familyName
        };
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
          orderBy: { name: 'asc' },
          include: {
            family: true // Include exercise family for familyName filtering and display
          }
        }),
        prisma.exercise.count({ where })
      ]);

      res.json({
        data: exercises,
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

  /**
   * POST /api/exercises
   * Create a new custom exercise
   */
  static async createExercise(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'You must be logged in to create an exercise'
        });
        return;
      }

      const {
        name,
        primaryCategory,
        difficulty,
        primaryMuscles,
        secondaryMuscles,
        equipment,
        description,
        instructions
      } = req.body;

      // Validate required fields
      if (!name || !primaryCategory || !difficulty || !primaryMuscles || primaryMuscles.length === 0) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'Name, category, difficulty, and at least one primary muscle are required'
        });
        return;
      }

      // Check for duplicate exercise name (case-insensitive)
      const existingExercise = await prisma.exercise.findFirst({
        where: {
          name: {
            equals: name.trim(),
            mode: 'insensitive'
          }
        }
      });

      if (existingExercise) {
        res.status(409).json({
          error: 'Duplicate Exercise',
          message: `An exercise named "${name.trim()}" already exists`
        });
        return;
      }

      // Generate unique slug
      const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const uniqueSlug = `${baseSlug}-${Date.now()}`;

      const exercise = await prisma.exercise.create({
        data: {
          name,
          slug: uniqueSlug,
          primaryCategory,
          difficulty,
          primaryMuscles: primaryMuscles || [],
          secondaryMuscles: secondaryMuscles || [],
          equipment: equipment || ['bodyweight'],
          description: description || null,
          instructions: instructions || [],
          createdBy: req.user.id,
          isVerified: false,
          hictSuitable: true,
          smallSpace: true,
          quiet: true,
          beginnerFriendly: difficulty === 'beginner',
          minimalTransition: true
        }
      });

      res.status(201).json({
        success: true,
        data: exercise,
        message: 'Exercise created successfully'
      });
    } catch (error) {
      console.error('Error creating exercise:', error);
      res.status(500).json({
        error: 'Failed to create exercise',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * PUT /api/exercises/:id
   * Update an existing exercise
   */
  static async updateExercise(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'You must be logged in.'
        });
        return;
      }

      const { id } = req.params;
      const {
        name,
        primaryCategory,
        difficulty,
        primaryMuscles,
        secondaryMuscles,
        equipment,
        description,
        instructions
      } = req.body;

      // 1. Find existing exercise
      const existingExercise = await prisma.exercise.findUnique({
        where: { id }
      });

      if (!existingExercise) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Exercise not found.'
        });
        return;
      }

      // 2. Check ownership
      if (existingExercise.createdBy !== req.user.id) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'You can only edit exercises you created.'
        });
        return;
      }

      // 3. Update
      const updatedExercise = await prisma.exercise.update({
        where: { id },
        data: {
          name: name || undefined,
          primaryCategory: primaryCategory || undefined,
          difficulty: difficulty || undefined,
          primaryMuscles: primaryMuscles || undefined,
          secondaryMuscles: secondaryMuscles || undefined,
          equipment: equipment || undefined,
          description: description || undefined,
          instructions: instructions || undefined,
          updatedAt: new Date()
        }
      });

      res.json({
        success: true,
        data: updatedExercise,
        message: 'Exercise updated successfully'
      });
    } catch (error) {
      console.error('Error updating exercise:', error);
      res.status(500).json({
        error: 'Update Failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * DELETE /api/exercises/:id
   * Soft delete an exercise
   */
  static async deleteExercise(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'You must be logged in.'
        });
        return;
      }

      const { id } = req.params;

      const existingExercise = await prisma.exercise.findUnique({ where: { id } });

      if (!existingExercise) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Exercise not found.'
        });
        return;
      }

      if (existingExercise.createdBy !== req.user.id) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'You can only delete exercises you created.'
        });
        return;
      }

      // Soft delete
      await prisma.exercise.update({
        where: { id },
        data: { deletedAt: new Date() }
      });

      res.json({
        success: true,
        message: 'Exercise deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting exercise:', error);
      res.status(500).json({
        error: 'Delete Failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
