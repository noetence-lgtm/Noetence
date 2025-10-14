/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FunctionDeclaration, Type } from '@google/genai';

/**
 * Gets the current time for a given location.
 * @param location The city or country to get the time for.
 * @returns A string describing the current time.
 * @note A more robust implementation would use a library like `moment-timezone`
 * or an external API to map a wider range of locations to IANA timezones.
 */
export function getTimeForCountry(location: string): string {
  const timezones: { [key: string]: string } = {
    // North America
    usa: 'America/New_York',
    'united states': 'America/New_York',
    'new york': 'America/New_York',
    'los angeles': 'America/Los_Angeles',
    canada: 'America/Toronto',
    mexico: 'America/Mexico_City',
    // Europe
    uk: 'Europe/London',
    'united kingdom': 'Europe/London',
    london: 'Europe/London',
    germany: 'Europe/Berlin',
    berlin: 'Europe/Berlin',
    france: 'Europe/Paris',
    paris: 'Europe/Paris',
    // Asia
    china: 'Asia/Shanghai',
    beijing: 'Asia/Shanghai',
    india: 'Asia/Kolkata',
    japan: 'Asia/Tokyo',
    tokyo: 'Asia/Tokyo',
    // Oceania
    australia: 'Australia/Sydney',
    sydney: 'Australia/Sydney',
  };

  const normalizedLocation = location.toLowerCase();
  const timezone = timezones[normalizedLocation];

  if (!timezone) {
    return `Sorry, I don't have timezone information for ${location}.`;
  }

  try {
    const date = new Date();
    const timeString = date.toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    return `The current time in ${location} is ${timeString}.`;
  } catch (error) {
    console.error(`Error getting time for timezone ${timezone}:`, error);
    return `Sorry, I encountered an error trying to get the time for ${location}.`;
  }
}

// --- Tool Declaration ---
export const getCurrentTimeFunctionDeclaration: FunctionDeclaration = {
  name: 'getCurrentTime',
  description: 'Gets the current time for a specific country or major city.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      location: {
        type: Type.STRING,
        description: 'The country or major city, e.g., "France" or "Tokyo".',
      },
    },
    required: ['location'],
  },
};
