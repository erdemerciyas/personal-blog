import { 
  CheckIcon,
  CurrencyDollarIcon,
  TagIcon 
} from '@heroicons/react/24/outline';

interface Service {
  _id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
  price?: {
    type: 'fixed' | 'hourly' | 'project';
    amount?: number;
    currency: string;
    note?: string;
  };
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ServiceCardProps {
  service: Service;
}

const ServiceCard = ({ service }: ServiceCardProps) => {
  const formatPrice = () => {
    if (!service.price) {
      return 'Fiyat Teklifi';
    }
    
    if (service.price.type === 'project') {
      return service.price.note || 'Proje Bazlı';
    }
    
    if (service.price.amount) {
      const symbol = service.price.currency === 'USD' ? '$' : service.price.currency === 'EUR' ? '€' : '₺';
      const unit = service.price.type === 'hourly' ? '/saat' : '';
      return `${symbol}${service.price.amount}${unit}`;
    }
    
    return 'Fiyat Teklifi';
  };

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-xl group">
      {/* Service Icon */}
      <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
        <span className="text-2xl">{service.icon || '⚙️'}</span>
      </div>

      {/* Service Title */}
      <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-teal-400 transition-colors duration-300">
        {service.title}
      </h3>

      {/* Service Description */}
      <p className="text-slate-300 text-base leading-relaxed mb-6">
        {service.description}
      </p>

      {/* Service Features */}
      {service.features && service.features.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
            <CheckIcon className="w-5 h-5 text-teal-400" />
            <span>Özellikler</span>
          </h4>
          <ul className="space-y-2">
            {service.features.slice(0, 4).map((feature, index) => (
              <li key={index} className="flex items-start space-x-2 text-slate-300 text-sm">
                <div className="w-2 h-2 bg-teal-400 rounded-full mt-2 flex-shrink-0"></div>
                <span>{feature}</span>
              </li>
            ))}
            {service.features.length > 4 && (
              <li className="text-teal-400 text-sm font-medium">
                +{service.features.length - 4} daha fazla özellik
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Price and Category */}
      <div className="flex items-center justify-between pt-6 border-t border-white/10">
        <div className="flex items-center space-x-2">
          <TagIcon className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-400">{service.category}</span>
        </div>
        
        <div className="flex items-center space-x-2 bg-teal-500/20 px-3 py-1 rounded-full">
          <CurrencyDollarIcon className="w-4 h-4 text-teal-400" />
          <span className="text-sm font-semibold text-teal-400">
            {formatPrice()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard; 