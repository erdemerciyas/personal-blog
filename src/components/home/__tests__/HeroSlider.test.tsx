import { render, screen, fireEvent, act } from '@testing-library/react';
import HeroSlider from '../HeroSlider';

// Mock next/image
jest.mock('next/image', () => ({
    __esModule: true,
    default: (props: any) => <img {...props} />,
}));

// Mock next/link
jest.mock('next/link', () => ({
    __esModule: true,
    default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

const mockItems = [
    {
        _id: '1',
        title: 'Test Slide 1',
        subtitle: 'Subtitle 1',
        description: 'Description 1',
        image: '/test-image-1.jpg',
        buttonText: 'Button 1',
        buttonLink: '/link-1',
        duration: 5000
    },
    {
        _id: '2',
        title: 'Test Slide 2',
        subtitle: 'Subtitle 2',
        description: 'Description 2',
        image: '/test-image-2.jpg',
        buttonText: 'Button 2',
        buttonLink: '/link-2',
        duration: 5000
    }
];

describe('HeroSlider', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('renders the first slide correctly', () => {
        render(<HeroSlider items={mockItems} />);

        expect(screen.getByText('Test Slide 1')).toBeInTheDocument();
        expect(screen.getByText('Subtitle 1')).toBeInTheDocument();
        expect(screen.getByText('Description 1')).toBeInTheDocument();
        expect(screen.getByText('Button 1')).toBeInTheDocument();
    });

    it('advances to the next slide automatically', () => {
        render(<HeroSlider items={mockItems} />);

        expect(screen.getByText('Test Slide 1')).toBeInTheDocument();

        act(() => {
            jest.advanceTimersByTime(5000);
        });

        expect(screen.getByText('Test Slide 2')).toBeInTheDocument();
    });

    it('navigates to next slide when next button is clicked', () => {
        render(<HeroSlider items={mockItems} />);

        const nextButton = screen.getByLabelText('Sonraki slayt');
        fireEvent.click(nextButton);

        expect(screen.getByText('Test Slide 2')).toBeInTheDocument();
    });

    it('navigates to previous slide when previous button is clicked', () => {
        render(<HeroSlider items={mockItems} />);

        const prevButton = screen.getByLabelText('Önceki slayt');
        fireEvent.click(prevButton);

        // Should go to last slide (Slide 2)
        expect(screen.getByText('Test Slide 2')).toBeInTheDocument();
    });

    it('pauses auto-play when pause button is clicked', () => {
        render(<HeroSlider items={mockItems} />);

        const pauseButton = screen.getByLabelText('Otomatik geçişi durdur');
        fireEvent.click(pauseButton);

        act(() => {
            jest.advanceTimersByTime(5000);
        });

        // Should still be on Slide 1
        expect(screen.getByText('Test Slide 1')).toBeInTheDocument();
    });
});
