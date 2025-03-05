import lincolnCounty from '../assets/json/lincoln-county.json';
import stLouisCityCounty from '../assets/json/st-louis-city-county.json';

const resourcesData = {
  resources: [...stLouisCityCounty.resources, ...lincolnCounty.resources]
};

// Define the types based on the structure of your resources
export interface ResourceLocation {
  address: string;
  latitude: number;
  longitude: number;
}

export interface ResourceContact {
  phone: string;
  website?: string;
}

export interface Resource {
  id: string;
  name: string;
  category: string;
  location: ResourceLocation;
  details: string;
  contact: ResourceContact;
  hours: string;
  languagesSupported: string[];
  averageRating: number;
}

/**
 * Get all available resources
 * @returns Array of all resources
 */
export function getAllResources(): Resource[] {
  return resourcesData.resources;
}

/**
 * Find a resource by its ID
 * @param id The ID of the resource to find
 * @returns The resource object or undefined if not found
 */
export function getResourceById(id: string): Resource | undefined {
  return resourcesData.resources.find(r => r.id === id);
}
