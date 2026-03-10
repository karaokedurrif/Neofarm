/* ══════════════════════════════════════════════════════════════════
 *  PEDIGREE SERVICE — Genealogy, Ancestors, Breed Contribution
 *  Pure functions, no side effects.
 * ══════════════════════════════════════════════════════════════════ */

import type { Bird, PedigreeNode, CommonAncestor } from '../types';

/** Build pedigree tree up to N generations */
export function getPedigree(
  birdId: string,
  birds: Bird[],
  maxGenerations = 4,
): PedigreeNode {
  const birdMap = new Map(birds.map(b => [b.id, b]));

  function buildNode(id: string | null, depth: number): PedigreeNode {
    if (!id || depth > maxGenerations) return { bird: null, depth };
    const bird = birdMap.get(id) || null;
    if (!bird) return { bird: null, depth };
    return {
      bird,
      padre: buildNode(bird.padreId, depth + 1),
      madre: buildNode(bird.madreId, depth + 1),
      depth,
    };
  }

  return buildNode(birdId, 0);
}

/** Find all ancestors of a bird (flat set) */
export function getAllAncestors(
  birdId: string,
  birds: Bird[],
  maxGen = 6,
): Set<string> {
  const birdMap = new Map(birds.map(b => [b.id, b]));
  const ancestors = new Set<string>();

  function walk(id: string | null, depth: number) {
    if (!id || depth > maxGen) return;
    const bird = birdMap.get(id);
    if (!bird) return;
    if (bird.padreId) { ancestors.add(bird.padreId); walk(bird.padreId, depth + 1); }
    if (bird.madreId) { ancestors.add(bird.madreId); walk(bird.madreId, depth + 1); }
  }

  walk(birdId, 0);
  return ancestors;
}

/** Find common ancestors between two birds (for COI calculation) */
export function findCommonAncestors(
  birdAId: string,
  birdBId: string,
  birds: Bird[],
  maxGen = 6,
): CommonAncestor[] {
  const birdMap = new Map(birds.map(b => [b.id, b]));
  const result: CommonAncestor[] = [];

  // Get all ancestor paths for each bird
  function getAncestorPaths(id: string | null, depth: number): Map<string, number[]> {
    const paths = new Map<string, number[]>();
    if (!id || depth > maxGen) return paths;
    const bird = birdMap.get(id);
    if (!bird) return paths;

    if (bird.padreId) {
      paths.set(bird.padreId, [...(paths.get(bird.padreId) || []), depth + 1]);
      const parentPaths = getAncestorPaths(bird.padreId, depth + 1);
      parentPaths.forEach((depths, ancestorId) => {
        const existing = paths.get(ancestorId) || [];
        paths.set(ancestorId, [...existing, ...depths]);
      });
    }
    if (bird.madreId) {
      paths.set(bird.madreId, [...(paths.get(bird.madreId) || []), depth + 1]);
      const parentPaths = getAncestorPaths(bird.madreId, depth + 1);
      parentPaths.forEach((depths, ancestorId) => {
        const existing = paths.get(ancestorId) || [];
        paths.set(ancestorId, [...existing, ...depths]);
      });
    }
    return paths;
  }

  const pathsA = getAncestorPaths(birdAId, 0);
  const pathsB = getAncestorPaths(birdBId, 0);

  // Find intersections
  pathsA.forEach((depthsA, ancestorId) => {
    const depthsB = pathsB.get(ancestorId);
    if (depthsB) {
      const ancestor = birdMap.get(ancestorId);
      if (ancestor) {
        const minA = Math.min(...depthsA);
        const minB = Math.min(...depthsB);
        const contribution = Math.pow(0.5, minA + minB + 1);
        result.push({
          ancestor,
          pathFromFather: minA,
          pathFromMother: minB,
          contribution,
        });
      }
    }
  });

  return result.sort((a, b) => b.contribution - a.contribution);
}

/** Get count of descendants */
export function getDescendantCount(birdId: string, birds: Bird[]): number {
  return birds.filter(b => b.padreId === birdId || b.madreId === birdId).length;
}

/** Calculate breed contribution from pedigree */
export function calculateBreedContribution(
  birdId: string,
  birds: Bird[],
  maxGen = 6,
): Record<string, number> {
  const birdMap = new Map(birds.map(b => [b.id, b]));
  const contributions: Record<string, number> = {};

  function walk(id: string | null, weight: number, depth: number) {
    if (!id || depth > maxGen) return;
    const bird = birdMap.get(id);
    if (!bird) return;

    // If F0 or no parents, all weight goes to this breed
    if (!bird.padreId && !bird.madreId) {
      contributions[bird.raza] = (contributions[bird.raza] || 0) + weight;
      return;
    }

    // Split weight between parents
    walk(bird.padreId, weight / 2, depth + 1);
    walk(bird.madreId, weight / 2, depth + 1);
  }

  const bird = birdMap.get(birdId);
  if (!bird) return {};

  if (!bird.padreId && !bird.madreId) {
    return { [bird.raza]: 1.0 };
  }

  walk(bird.padreId, 0.5, 1);
  walk(bird.madreId, 0.5, 1);

  return contributions;
}

/** Get the expected generation of offspring */
export function getOffspringGeneration(fatherGen: string, motherGen: string): string {
  const genOrder = ['F0', 'F1', 'F2', 'F3', 'F4', 'F5+'];
  const maxIdx = Math.max(genOrder.indexOf(fatherGen), genOrder.indexOf(motherGen));
  const nextIdx = Math.min(maxIdx + 1, genOrder.length - 1);
  return genOrder[nextIdx];
}
