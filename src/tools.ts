/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FunctionDeclaration, Type } from '@google/genai';

/**
 * Gets the current time for a given IANA timezone.
 * The model is expected to provide the correct IANA timezone identifier.
 * @param timezone The IANA timezone identifier (e.g., "Europe/Paris").
 * @returns A string describing the current time for that timezone.
 */
export function getCurrentTime(timezone: string): string {
  if (!timezone) {
    return 'Sorry, a timezone must be provided.';
  }

  try {
    // FIX: Removed use of `Intl.supportedValuesOf` as it's not available in all JS environments.
    // The `toLocaleTimeString` method will throw a RangeError for invalid timezones,
    // which is caught by the existing try-catch block.
    const date = new Date();
    const timeString = date.toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    return `The current time for the timezone ${timezone} is ${timeString}.`;
  } catch (error) {
    console.error(`Error getting time for timezone ${timezone}:`, error);
    return `Sorry, I could not get the time for the timezone: ${timezone}. It might be an invalid identifier.`;
  }
}

// --- Tool Declaration ---
export const getCurrentTimeFunctionDeclaration: FunctionDeclaration = {
  name: 'getCurrentTime',
  description:
    'Gets the current time for a given IANA timezone identifier. The model should determine the appropriate IANA timezone from the user query.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      timezone: {
        type: Type.STRING,
        description:
          "The IANA timezone identifier, for example 'America/New_York' or 'Europe/Paris'.",
      },
    },
    required: ['timezone'],
  },
};
