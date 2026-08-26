import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '../../src/app/store';
import { createBotanicalGardenDemoDataset } from '../../src/data/demoBotanicalGarden';

describe('Zustand App Store', () => {
  beforeEach(() => {
    useAppStore.getState().resetAll();
  });

  it('loads demo dataset correctly', async () => {
    await useAppStore.getState().loadDemoDataset();
    const state = useAppStore.getState();

    expect(state.datasets).toHaveLength(1);
    expect(state.activeDatasetId).toBe('demo_botanical_garden_group6');
    expect(state.datasets[0].featureCollection.features).toHaveLength(14);
    expect(state.datasets[0].categories.length).toBeGreaterThan(5);
  });

  it('selects and deselects features', async () => {
    await useAppStore.getState().loadDemoDataset();
    const state = useAppStore.getState();

    state.selectFeature('demo_botanical_garden_group6', 'feat_1');
    const selected = useAppStore.getState().selectedFeature;

    expect(selected).not.toBeNull();
    expect(selected?.internalId).toBe('feat_1');
    expect(selected?.feature.properties.__displayName).toBe('Botanical Garden Main Gate');
    expect(useAppStore.getState().isInspectorOpen).toBe(true);

    useAppStore.getState().clearSelection();
    expect(useAppStore.getState().selectedFeature).toBeNull();
    expect(useAppStore.getState().isInspectorOpen).toBe(false);
  });

  it('toggles category visibility', async () => {
    await useAppStore.getState().loadDemoDataset();
    useAppStore.getState().setCategoryVisibility('Entrance', false);

    expect(useAppStore.getState().categoryFilter['Entrance']).toBe(false);
  });
});
