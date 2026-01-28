// useCharacterSheetLayout Hook - Scroll collapse, responsive detection, tab management

import { useState, useEffect, useRef } from 'react';
import type { Character } from 'shared';

// Threshold in pixels to trigger collapse
const SCROLL_THRESHOLD = 50;

// Breakpoints
const MOBILE_BREAKPOINT = 650;
const WIDE_TABLET_BREAKPOINT = 850;

// Tab IDs for unified mobile navigation
type MobileTabId = 'abilities' | 'actions' | 'spells' | 'inventory' | 'bio' | 'class';

export function useCharacterSheetLayout(character: Character) {
  const [headerExpanded, setHeaderExpanded] = useState(true);
  const [mobileTab, setMobileTab] = useState<MobileTabId>('abilities');
  const [isMobileMode, setIsMobileMode] = useState(false);
  const [isTabletMode, setIsTabletMode] = useState(false); // 650-849px
  const [conditionsOpen, setConditionsOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const isManualToggle = useRef(false);
  const waitingAtTop = useRef(false);

  // Track window width for mobile/tablet mode
  useEffect(() => {
    const checkWidth = () => {
      const width = window.innerWidth;
      setIsMobileMode(width < WIDE_TABLET_BREAKPOINT);
      setIsTabletMode(width >= MOBILE_BREAKPOINT && width < WIDE_TABLET_BREAKPOINT);
    };
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  // Close more menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setMoreMenuOpen(false);
      }
    };
    if (moreMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [moreMenuOpen]);

  // Auto-collapse header on scroll (mobile only)
  useEffect(() => {
    const isMobile = window.innerWidth < 650;
    if (!isMobile) return;

    const handleScroll = () => {
      if (isManualToggle.current) {
        isManualToggle.current = false;
        lastScrollY.current = window.scrollY;
        return;
      }

      const currentScrollY = window.scrollY;
      const scrollingUp = currentScrollY < lastScrollY.current;

      if (currentScrollY <= 10) {
        if (waitingAtTop.current && scrollingUp) {
          setHeaderExpanded(true);
          waitingAtTop.current = false;
        } else if (!headerExpanded && !waitingAtTop.current) {
          waitingAtTop.current = true;
        }
      } else if (currentScrollY > 10) {
        waitingAtTop.current = false;
        if (currentScrollY > lastScrollY.current && currentScrollY > SCROLL_THRESHOLD) {
          setHeaderExpanded(false);
        }
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleToggleExpand = () => {
    isManualToggle.current = true;
    setHeaderExpanded(!headerExpanded);
  };

  // Build available mobile tabs - split into main and more
  const mainTabs: { id: MobileTabId; label: string }[] = [
    { id: 'abilities', label: 'Stats' },
    { id: 'actions', label: 'Actions' },
    { id: 'spells', label: 'Spells' },
    { id: 'inventory', label: 'Items' },
  ];

  const moreTabs: { id: MobileTabId; label: string }[] = [
    { id: 'bio', label: 'Bio' },
    { id: 'class', label: 'Class' },
  ];

  // Filter out spells tab if hidden
  const visibleMainTabs = mainTabs.filter(
    (tab) => !(tab.id === 'spells' && character.hideSpellsTab)
  );

  // Check if current tab is in "more" menu
  const isMoreTabActive = moreTabs.some((t) => t.id === mobileTab);

  // All tabs for validation
  const allTabs = [...visibleMainTabs, ...moreTabs];

  // True mobile (< 650px) - show "..." menu; Tablet (>= 650px) - show all tabs
  const isTrueMobile = isMobileMode && !isTabletMode;

  // Ensure active tab is valid
  useEffect(() => {
    if (!allTabs.find((t) => t.id === mobileTab) && allTabs.length > 0) {
      setMobileTab(allTabs[0].id);
    }
  }, [allTabs, mobileTab]);

  // Map mobile tab to RightPanel tab
  const getRightPanelTab = (): 'actions' | 'spells' | 'inventory' | 'bio' | 'class' | null => {
    if (mobileTab === 'abilities') return null;
    return mobileTab;
  };

  return {
    // State
    headerExpanded,
    mobileTab,
    setMobileTab,
    isMobileMode,
    isTabletMode,
    isTrueMobile,
    conditionsOpen,
    setConditionsOpen,
    moreMenuOpen,
    setMoreMenuOpen,
    moreMenuRef,
    // Computed
    visibleMainTabs,
    moreTabs,
    isMoreTabActive,
    // Handlers
    handleToggleExpand,
    getRightPanelTab,
  };
}
