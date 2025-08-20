import { describe, it, expect } from 'vitest';
import { formatViews, formatNumber, formatDuration, formatSubscribers } from '../formatters';

describe('formatViews', () => {
  it('formats views under 1000', () => {
    expect(formatViews(0)).toBe('0 views');
    expect(formatViews(1)).toBe('1 views');
    expect(formatViews(999)).toBe('999 views');
  });

  it('formats views in thousands', () => {
    expect(formatViews(1000)).toBe('1.0K views');
    expect(formatViews(1500)).toBe('1.5K views');
    expect(formatViews(999999)).toBe('1000.0K views');
  });

  it('formats views in millions', () => {
    expect(formatViews(1000000)).toBe('1.0M views');
    expect(formatViews(1500000)).toBe('1.5M views');
    expect(formatViews(10000000)).toBe('10.0M views');
  });
});

describe('formatNumber', () => {
  it('formats numbers under 1000', () => {
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(999)).toBe('999');
  });

  it('formats numbers in thousands', () => {
    expect(formatNumber(1000)).toBe('1.0K');
    expect(formatNumber(1500)).toBe('1.5K');
  });

  it('formats numbers in millions', () => {
    expect(formatNumber(1000000)).toBe('1.0M');
    expect(formatNumber(2500000)).toBe('2.5M');
  });
});

describe('formatDuration', () => {
  it('formats seconds only', () => {
    expect(formatDuration(30)).toBe('0:30');
    expect(formatDuration(59)).toBe('0:59');
  });

  it('formats minutes and seconds', () => {
    expect(formatDuration(60)).toBe('1:00');
    expect(formatDuration(90)).toBe('1:30');
    expect(formatDuration(3599)).toBe('59:59');
  });

  it('formats hours, minutes, and seconds', () => {
    expect(formatDuration(3600)).toBe('1:00:00');
    expect(formatDuration(3661)).toBe('1:01:01');
    expect(formatDuration(7200)).toBe('2:00:00');
  });
});

describe('formatSubscribers', () => {
  it('formats subscribers under 1000', () => {
    expect(formatSubscribers(0)).toBe('0 subscribers');
    expect(formatSubscribers(1)).toBe('1 subscribers');
    expect(formatSubscribers(999)).toBe('999 subscribers');
  });

  it('formats subscribers in thousands', () => {
    expect(formatSubscribers(1000)).toBe('1.0K subscribers');
    expect(formatSubscribers(1500)).toBe('1.5K subscribers');
  });

  it('formats subscribers in millions', () => {
    expect(formatSubscribers(1000000)).toBe('1.0M subscribers');
    expect(formatSubscribers(2500000)).toBe('2.5M subscribers');
  });
});