import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProjectModal from '../ProjectModal';
import { useToast } from '../../ui/useToast';

// Mock useToast
jest.mock('../../ui/useToast', () => ({
    useToast: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe('ProjectModal', () => {
    const mockOnClose = jest.fn();
    const mockShowToast = jest.fn();

    beforeEach(() => {
        (useToast as jest.Mock).mockReturnValue({ show: mockShowToast });
        (global.fetch as jest.Mock).mockClear();
        mockOnClose.mockClear();
        mockShowToast.mockClear();
    });

    it('renders nothing when isOpen is false', () => {
        render(<ProjectModal isOpen={false} onClose={mockOnClose} />);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders modal when isOpen is true', () => {
        render(<ProjectModal isOpen={true} onClose={mockOnClose} />);
        expect(screen.getByText('Proje Başvurusu')).toBeInTheDocument();
        expect(screen.getByLabelText('Ad Soyad *')).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
        render(<ProjectModal isOpen={true} onClose={mockOnClose} />);

        const closeButton = screen.getByLabelText('Diyaloğu kapat');
        fireEvent.click(closeButton);

        expect(mockOnClose).toHaveBeenCalled();
    });

    it('submits the form with valid data', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ success: true }),
        });

        render(<ProjectModal isOpen={true} onClose={mockOnClose} />);

        // Fill form
        fireEvent.change(screen.getByLabelText('Ad Soyad *'), { target: { value: 'John Doe' } });
        fireEvent.change(screen.getByLabelText('E-posta *'), { target: { value: 'john@example.com' } });
        fireEvent.change(screen.getByLabelText('Proje Türü *'), { target: { value: '3d-modeling' } });
        fireEvent.change(screen.getByLabelText('Proje Detayları *'), { target: { value: 'Test description' } });

        // Submit
        const submitButton = screen.getByText('Başvuruyu Gönder');
        fireEvent.click(submitButton);

        // Check loading state
        expect(screen.getByText('Gönderiliyor...')).toBeInTheDocument();

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/contact', expect.objectContaining({
                method: 'POST',
                body: expect.stringContaining('John Doe'),
            }));
        });

        // Check success toast
        await waitFor(() => {
            expect(mockShowToast).toHaveBeenCalledWith(expect.objectContaining({
                title: 'Başvurunuz alındı',
                variant: 'success',
            }));
        });

        // Check auto-close
        await waitFor(() => {
            expect(mockOnClose).toHaveBeenCalled();
        }, { timeout: 3000 });
    });

    it('shows error toast on submission failure', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
        });

        render(<ProjectModal isOpen={true} onClose={mockOnClose} />);

        // Fill form
        fireEvent.change(screen.getByLabelText('Ad Soyad *'), { target: { value: 'John Doe' } });
        fireEvent.change(screen.getByLabelText('E-posta *'), { target: { value: 'john@example.com' } });
        fireEvent.change(screen.getByLabelText('Proje Türü *'), { target: { value: '3d-modeling' } });
        fireEvent.change(screen.getByLabelText('Proje Detayları *'), { target: { value: 'Test description' } });

        // Submit
        fireEvent.click(screen.getByText('Başvuruyu Gönder'));

        await waitFor(() => {
            expect(mockShowToast).toHaveBeenCalledWith(expect.objectContaining({
                title: 'Gönderilemedi',
                variant: 'danger',
            }));
        });
    });
});
