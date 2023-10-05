import React, { ReactNode } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CustomToolbar } from '@/components/calendar/CustomToolbar';
import "@testing-library/jest-dom";

jest.mock('@mui/material', () => ({
    ...jest.requireActual('@mui/material'),
    Hidden: ({ children }: { children: ReactNode }) => children,
}));

describe('<CustomToolbar />', () => {
  const mockOnNavigate = jest.fn();
  beforeEach(() => {
    mockOnNavigate.mockReset();
  });

  test('renders label correctly', () => {
    render(<CustomToolbar label="January 2023" onNavigate={mockOnNavigate} />);
    const labels = screen.getAllByText('January 2023');
    expect(labels).toHaveLength(2);
  });

  test('triggers onNavigate when Back button is clicked', () => {
    render(<CustomToolbar label="January 2023" onNavigate={mockOnNavigate} />);
    // 2つの 'Back' ボタンを取得
    const backButtons = screen.getAllByText('Back');
    expect(backButtons).toHaveLength(2);

    // 1つ目の 'Back' ボタンをクリック
    fireEvent.click(backButtons[0]);
    expect(mockOnNavigate).toHaveBeenCalledWith('PREV');

    // mockOnNavigate の呼び出し回数をリセット
    mockOnNavigate.mockClear();

    // 2つ目の 'Back' ボタンをクリック
    fireEvent.click(backButtons[1]);
    expect(mockOnNavigate).toHaveBeenCalledWith('PREV');

    // 'January 2023' ラベルが2つ表示されていることを確認するテスト
    const labels = screen.getAllByText('January 2023');
    expect(labels).toHaveLength(2);

  });

  test('triggers onNavigate when Today button is clicked', () => {
    render(<CustomToolbar label="January 2023" onNavigate={mockOnNavigate} />);
    // 2つの 'Today' ボタンを取得
    const todayButtons = screen.getAllByText('Today');
    expect(todayButtons).toHaveLength(2);

    // 1つ目の 'Today' ボタンをクリック
    fireEvent.click(todayButtons[0]);
    expect(mockOnNavigate).toHaveBeenCalledWith('TODAY');

    // mockOnNavigate の呼び出し回数をリセット
    mockOnNavigate.mockClear();

    // 2つ目の 'Today' ボタンをクリック
    fireEvent.click(todayButtons[1]);
    expect(mockOnNavigate).toHaveBeenCalledWith('TODAY');

    // 'January 2023' ラベルが2つ表示されていることを確認するテスト
    const labels = screen.getAllByText('January 2023');
    expect(labels).toHaveLength(2);
  });

  test('triggers onNavigate when Next button is clicked', () => {
    render(<CustomToolbar label="January 2023" onNavigate={mockOnNavigate} />);
    // 2つの 'Next' ボタンを取得
    const nextButtons = screen.getAllByText('Next');
    expect(nextButtons).toHaveLength(2);

    // 1つ目の 'Next' ボタンをクリック
    fireEvent.click(nextButtons[0]);
    expect(mockOnNavigate).toHaveBeenCalledWith('NEXT');

    // mockOnNavigate の呼び出し回数をリセット
    mockOnNavigate.mockClear();

    // 2つ目の 'Next' ボタンをクリック
    fireEvent.click(nextButtons[1]);
    expect(mockOnNavigate).toHaveBeenCalledWith('NEXT');

    // 'January 2023' ラベルが2つ表示されていることを確認するテスト
    const labels = screen.getAllByText('January 2023');
    expect(labels).toHaveLength(2);
  });

});
