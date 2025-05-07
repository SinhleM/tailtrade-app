import React from 'react';
import Header from './Header';
import Hero from './Hero';
import NavIcons from './NavIcons';
import PopularBreeds from './PopularBreeds';
import ListedPets from './ListedPets';
import PetServices from './PetServices';
import Footer from './Footer';


const TailTradeHomepage = () => {
  // Sample pet data
  const featuredPets = [
    { id: 1, name: 'Max', type: 'Dog', breed: 'Labrador Retriever', price: 'R 1,200.00', location: 'Johannesburg', image: '.\src/placeholder images/list-lab.jpg.jpg' },
    { id: 2, name: 'Bella', type: 'Dog', breed: 'French Bulldog', price: 'R 2,500.00', location: 'Cape Town', image: '.\src/placeholder images/list-frech-bull.jpg.jpg' },
    { id: 3, name: 'Luna', type: 'Cat', breed: 'Siamese', price: 'R 850.00', location: 'Durban', image: '.\src/placeholder images/list-siamese.jpg.jpg' },
    { id: 4, name: 'Rocky', type: 'Dog', breed: 'Golden Retriever', price: 'R 1,700.00', location: 'Pretoria', image: '.\src/placeholder images/list-golden-retriever.jpg.jpg' },
  ];

  // Popular breeds
  //
  const popularBreeds = [
    { name: 'Boerboel', icon: '.\src/placeholder images/icon-boerboel.jpg.jpg', type: 'Boerboel Dog' },
    { name: 'Labrador Retriever', icon: '.\src/placeholder images/icon-golden-retriever.jpg.jpg', type: 'Labrador Dog' },
    { name: 'Yorkshire Terrier', icon: '.\src/placeholder images/icon-yorkshire.jpg.jpg', type: 'Yorkshite Dog' },
    { name: 'Maine Coon', icon: '.\src/placeholder images/icon-maine-coon.jpg.jpg', type: 'Maine Coon Cat' },
    { name: 'Ragdoll', icon: '.\src/placeholder images/icon-ragdol.jpg.jpg', type: 'RagDoll Cat' },
  ];

  // Simple scroll function
  const scrollToSection = (sectionId) => (event) => {
    event.preventDefault();
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: 'Arial, sans-serif' }}>
      <Header scrollToSection={scrollToSection} />
      <Hero />
      
      <NavIcons scrollToSection={scrollToSection} />
      <PopularBreeds breeds={popularBreeds} />
      <ListedPets pets={featuredPets} />
      <PetServices />
      <Footer scrollToSection={scrollToSection} />
    </div>
  );
};

export default TailTradeHomepage;