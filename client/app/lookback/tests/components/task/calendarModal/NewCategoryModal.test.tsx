import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import '@testing-library/jest-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { store } from '@/store/store';
import NewCategoryModal from '@/components/task/categoryModal/NewCategoryModal';

describe('<NewCategoryModal />', () => {
    let getByLabelText: ReturnType<typeof render>['getByLabelText'];
    let getByText: ReturnType<typeof render>['getByText'];

    beforeEach(() => {
        const renderResult = render(
            <Provider store={store}>
                <ThemeProvider theme={createTheme()}>
                    <NewCategoryModal
                        open={true}
                        onClose={() => {}}
                    />
                </ThemeProvider>
            </Provider>
        );

        getByLabelText = renderResult.getByLabelText;
        getByText = renderResult.getByText;
    });

    test('renders NewCategoryModal component correctly', () => {
        expect(getByLabelText('New category')).toBeInTheDocument();
    });

    test('enables the save button when input is filled', () => {
        const input = getByLabelText('New category');
        const saveButton = getByText('SAVE');
        
        expect(saveButton).toBeDisabled();

        fireEvent.change(input, { target: { value: 'Sample Category' } });
        expect(saveButton).not.toBeDisabled();
    });
});
