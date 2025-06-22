import { ShoppingBag } from 'lucide-react';

const PetServices = () => {
  const services = [
    { name: 'Pet Grooming', url: 'https://www.cleanpaws.co.za/' },
    { name: 'SPCA', url: 'https://nspca.co.za/' },
    { name: 'Veterinary', url: 'https://www.fourwaysvet.co.za/' },
    { name: 'Pet Day Care', url: 'https://www.furrykidz.co.za/' },
    { name: 'Pet Sitter', url: 'https://igppetsitting.wixsite.com/ingoodpaws' }
  ];
  
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8 text-center">PET <span style={{ color: 'var(--color-primary)' }}>SERVICES</span></h2>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
          {services.map((service, index) => (
            <a 
              key={index} 
              href={service.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex flex-col items-center p-2 rounded-lg hover:bg-orange-50 transition-colors group"
            >
              <div className="w-10 h-10 mb-2 flex items-center justify-center text-gray-600 group-hover:text-orange-600 transition-colors">
                <ShoppingBag size={24} />
              </div>
              <span className="text-xs sm:text-sm text-center text-gray-700">{service.name}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PetServices;