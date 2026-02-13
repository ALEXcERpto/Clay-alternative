import { ValidationResult } from '../types';
import { prospeoService } from './prospeoService';
import { icypeasService } from './icypeasService';

/**
 * Waterfall Email Validator
 *
 * Validates emails using a waterfall approach:
 * 1. Try Prospeo first
 * 2. If Prospeo fails or returns invalid, try Icypeas
 * 3. If both fail or return invalid, mark as invalid
 *
 * This maximizes validation coverage by leveraging multiple providers.
 */
class WaterfallValidator {
  /**
   * Validate an email using the waterfall approach
   * @param email - Email address to validate
   * @returns Validation result with source information
   */
  async validateEmail(email: string): Promise<ValidationResult> {
    if (!email || !this.isValidEmailFormat(email)) {
      return {
        isValid: false,
        validatedBy: null,
        error: 'Invalid email format',
      };
    }

    try {
      // Step 1: Try Prospeo first
      console.log(`[Waterfall] Validating ${email} with Prospeo...`);
      const prospeoResult = await prospeoService.validateEmail(email);

      if (prospeoResult.success && prospeoResult.isValid) {
        console.log(`[Waterfall] ✓ ${email} validated by Prospeo`);
        return {
          isValid: true,
          validatedBy: 'prospeo',
          details: prospeoResult.data,
        };
      }

      // Step 2: Prospeo failed or returned invalid, fallback to Icypeas
      console.log(`[Waterfall] Prospeo ${prospeoResult.success ? 'returned invalid' : 'failed'}, trying Icypeas...`);
      const icypeasResult = await icypeasService.validateEmail(email);

      if (icypeasResult.success && icypeasResult.isValid) {
        console.log(`[Waterfall] ✓ ${email} validated by Icypeas`);
        return {
          isValid: true,
          validatedBy: 'icypeas',
          details: icypeasResult.data,
        };
      }

      // Step 3: Both returned invalid or failed
      console.log(`[Waterfall] ✗ ${email} validation failed on both services`);
      return {
        isValid: false,
        validatedBy: null,
        error: 'Email validation failed on both services',
        details: {
          prospeo: prospeoResult,
          icypeas: icypeasResult,
        },
      };
    } catch (error) {
      console.error(`[Waterfall] Error validating ${email}:`, error);
      return {
        isValid: false,
        validatedBy: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Basic email format validation
   * @param email - Email to validate
   * @returns True if email format is valid
   */
  private isValidEmailFormat(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate multiple emails in batches
   * @param emails - Array of email addresses
   * @param batchSize - Number of emails to process concurrently (default: 10)
   * @param onProgress - Optional callback for progress updates
   * @returns Array of validation results
   */
  async validateBatch(
    emails: string[],
    batchSize: number = 10,
    onProgress?: (completed: number, total: number) => void
  ): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    const total = emails.length;

    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);

      // Process batch concurrently
      const batchResults = await Promise.all(
        batch.map((email) => this.validateEmail(email))
      );

      results.push(...batchResults);

      // Report progress
      if (onProgress) {
        onProgress(results.length, total);
      }
    }

    return results;
  }
}

export const waterfallValidator = new WaterfallValidator();
