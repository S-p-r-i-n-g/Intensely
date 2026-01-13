import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export class UsersController {
  /**
   * GET /api/users/me
   * Get current user profile
   */
  static async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User not authenticated'
        });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: {
          preferences: true
        }
      });

      if (!user) {
        res.status(404).json({
          error: 'User not found',
          message: 'User profile not found in database'
        });
        return;
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({
        error: 'Failed to fetch user',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * POST /api/users/sync
   * Create or sync user profile from Supabase Auth
   */
  static async syncUser(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User not authenticated'
        });
        return;
      }

      const { email, displayName, avatarUrl } = req.body || {};

      // Upsert user
      const user = await prisma.user.upsert({
        where: { id: req.user.id },
        update: {
          email: email || req.user.email,
          displayName: displayName || undefined,
          avatarUrl: avatarUrl || undefined
        },
        create: {
          id: req.user.id,
          email: email || req.user.email || '',
          authProvider: 'supabase',
          displayName: displayName || null,
          avatarUrl: avatarUrl || null,
          firstName: null,
          lastName: null
        },
        include: {
          preferences: true
        }
      });

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Error syncing user:', error);
      res.status(500).json({
        error: 'Failed to sync user',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/users/preferences
   * Get user workout preferences
   */
  static async getPreferences(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User not authenticated'
        });
        return;
      }

      const preferences = await prisma.userPreference.findUnique({
        where: { userId: req.user.id }
      });

      if (!preferences) {
        res.status(404).json({
          error: 'Preferences not found',
          message: 'User preferences not set'
        });
        return;
      }

      res.json({
        success: true,
        data: preferences
      });
    } catch (error) {
      console.error('Error fetching preferences:', error);
      res.status(500).json({
        error: 'Failed to fetch preferences',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * PUT /api/users/preferences
   * Update user workout preferences
   */
  static async updatePreferences(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User not authenticated'
        });
        return;
      }

      const {
        defaultDifficulty,
        availableEquipment,
        workoutDuration,
        workoutFrequency,
        preferredTimeOfDay,
        fitnessGoals,
        hasSmallSpace,
        needsQuietWorkouts,
        experienceLevel,
        injuriesOrLimitations
      } = req.body;

      // Upsert preferences
      const preferences = await prisma.userPreference.upsert({
        where: { userId: req.user.id },
        update: {
          defaultDifficulty,
          availableEquipment,
          workoutDuration,
          workoutFrequency,
          preferredTimeOfDay,
          fitnessGoals,
          hasSmallSpace,
          needsQuietWorkouts,
          experienceLevel,
          injuriesOrLimitations
        },
        create: {
          userId: req.user.id,
          defaultDifficulty: defaultDifficulty || 'intermediate',
          availableEquipment: availableEquipment || ['bodyweight'],
          workoutDuration,
          workoutFrequency,
          preferredTimeOfDay,
          fitnessGoals,
          hasSmallSpace,
          needsQuietWorkouts,
          experienceLevel,
          injuriesOrLimitations
        }
      });

      res.json({
        success: true,
        data: preferences
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      res.status(500).json({
        error: 'Failed to update preferences',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
