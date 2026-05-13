import { describe, expect, it } from 'vitest';
import { getVisibleNavItems, isNavItemActive } from './SidebarNav';

describe('getVisibleNavItems', () => {
  it('shows the medical panel only for doctors', () => {
    expect(getVisibleNavItems('DOCTOR').some((item) => item.to === '/doctor')).toBe(true);
    expect(getVisibleNavItems('NURSE').some((item) => item.to === '/doctor')).toBe(false);
    expect(getVisibleNavItems('TCAE').some((item) => item.to === '/doctor')).toBe(false);
  });

  it('keeps nurse-specific views out of the doctor navigation', () => {
    expect(getVisibleNavItems('DOCTOR').some((item) => item.to === '/nurse')).toBe(false);
    expect(getVisibleNavItems('NURSE').some((item) => item.to === '/nurse')).toBe(true);
  });

  it('gives nurses direct access to assigned patients', () => {
    expect(getVisibleNavItems('NURSE').some((item) => item.to === '/beds?tab=my-patients')).toBe(true);
    expect(getVisibleNavItems('DOCTOR').some((item) => item.to === '/beds?tab=my-patients')).toBe(false);
  });

  it('gives TCAE quick access to assigned patients', () => {
    expect(getVisibleNavItems('TCAE').some((item) => item.to === '/beds?tab=my-patients')).toBe(true);
  });

  it('matches query-specific nav items exactly', () => {
    expect(isNavItemActive('/beds', '/beds', '?tab=my-patients')).toBe(false);
    expect(isNavItemActive('/beds?tab=my-patients', '/beds', '?tab=my-patients')).toBe(true);
    expect(isNavItemActive('/beds?tab=my-patients', '/beds', '')).toBe(false);
  });
});
