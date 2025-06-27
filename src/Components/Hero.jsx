const Hero = () => {
  return (
    <section className="relative bg-gray-100 py-16">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 mb-8 md:mb-0">
          <div className="p-6 rounded-lg bg-gray-150">
            <h2 className="text-gray-800 text-6xl font-bold mb-2 italic">Where <span style={{ color: 'var(--color-primary)' }}>Tails</span> Find-</h2>
            <h2 className="text-gray-800 text-5xl font-bold mb-4 italic">New Homes</h2>
            <p className="text-gray-800 mb-6 text-2xl font-semibold italic">And <span style={{ color: 'var(--color-primary)' }}>YOU</span> find life long companions</p>
          </div>
        </div>
        <div className="md:w-1/2 flex justify-center md:justify-end">
          {/* Corrected image source path */}
          <img src="/placeholder images/hero.jpg.jpg" alt="Dog" className="rounded-lg shadow-lg h-80 object-cover mr-4" />
        </div>
      </div>
    </section>
  );
};

export default Hero;