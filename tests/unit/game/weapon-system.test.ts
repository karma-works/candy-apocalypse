import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WeaponSystem } from '../../../src/game/components/WeaponSystem';
import { Inventory } from '../../../src/game/components/Inventory';
import { Entity } from '../../../src/game/entities/Entity';
import * as GameAudio from '../../../src/engine/audio/GameAudio';

// Mock BabylonJS Core
vi.mock('@babylonjs/core', () => {
    return {
        Scene: vi.fn(),
        Ray: vi.fn(),
        Vector3: vi.fn(),
        Color4: vi.fn(),
        ParticleSystem: vi.fn().mockImplementation(() => ({
            start: vi.fn(),
            dispose: vi.fn(),
        })),
        Texture: vi.fn(),
        AbstractMesh: vi.fn()
    };
});

// Mock GameAudio
vi.mock('../../../src/engine/audio/GameAudio', () => ({
    playSound: vi.fn()
}));

// Mock game store to prevent Zustand errors during testing
vi.mock('../../../src/game/state/gameStore', () => ({
    useGameStore: {
        getState: () => ({
            setAmmo: vi.fn(),
            setCurrentWeapon: vi.fn()
        })
    }
}));

describe('WeaponSystem', () => {
    let weaponSystem: WeaponSystem;
    let mockScene: any;
    let mockEntity: Entity;
    let inventory: Inventory;

    beforeEach(() => {
        vi.clearAllMocks();
        mockScene = {};
        weaponSystem = new WeaponSystem(mockScene);

        // Create a mock entity to hold components
        mockEntity = new Entity('test', 'Player');
        inventory = new Inventory();
        mockEntity.addComponent(inventory);
        mockEntity.addComponent(weaponSystem);

        // Give some weapons
        inventory.addWeapon('pistol', 50, 200);
        inventory.addWeapon('shotgun', 10, 50);
    });

    describe('Weapon Switching Logic', () => {
        it('should switch weapons successfully if in inventory', () => {
            const success = weaponSystem.switchWeapon('shotgun');
            expect(success).toBe(true);
            expect(weaponSystem.getCurrentWeapon()?.type).toBe('shotgun');
            expect(GameAudio.playSound).toHaveBeenCalledWith('weapon_switch');
        });

        it('should fail to switch to weapon not in inventory', () => {
            const success = weaponSystem.switchWeapon('bfg9000');
            expect(success).toBe(false);
            expect(weaponSystem.getCurrentWeapon()).toBeNull();
        });

        it('should fail to switch to invalid weapon type', () => {
            const success = weaponSystem.switchWeapon('invalid_weapon');
            expect(success).toBe(false);
            expect(weaponSystem.getCurrentWeapon()).toBeNull();
        });
    });
});
