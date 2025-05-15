import React from 'react';
import Header from './Header';
import Hero from './Hero';
import NavIcons from './NavIcons';
import PopularBreeds from './PopularBreeds';
import ListedPets from './ListedPets';
import PetServices from './PetServices';
import Footer from './Footer';

const TailTradeHomepage = () => {
  const featuredPets = [
    {
      id: 1,
      name: 'Max',
      type: 'Dog',
      breed: 'Labrador Retriever',
      price: 'R 1,200.00',
      location: 'Johannesburg',
      image: '/images/list-lab.webp (1).webp'
    },
    {
      id: 2,
      name: 'Cat Scratching Post',
      type: 'Dog',
      breed: 'Supply Item',
      price: 'R 500.00',
      location: 'Cape Town',
      image: '/images/ihnatsi-catPost2.jpg'
    },
    {
      id: 3,
      name: 'Luna',
      type: 'Cat',
      breed: 'Siamese',
      price: 'R 850.00',
      location: 'Durban',
      image: '/images/list-siamese.webp (1).webp'
    },
    {
      id: 4,
      name: 'Rocky',
      type: 'Dog',
      breed: 'Golden Retriever',
      price: 'R 1,700.00',
      location: 'Pretoria',
      image: '/images/list-golden-retriever.webp (1).webp'
    },
  ];

  const popularBreeds = [
    {
      name: 'Boerboel',
      icon: '/images/icon-boerboel.webp (1).webp',
      type: 'Boerboel Dog'
    },
    {
      name: 'Labrador Retriever',
      icon: '/images/ben-labrador.jpg',
      type: 'Labrador Dog'
    },
    {
      name: 'Yorkshire Terrier',
      icon: '/images/icon-yorkshire.webp (1).webp',
      type: 'Yorkshire Dog'
    },
    {
      name: 'Maine Coon',
      icon: '/images/icon-maine-coon.webp (1).webp',
      type: 'Maine Coon Cat'
    },
    {
      name: 'Ragdoll',
      icon: '/images/icon-ragdol.webp (1).webp',
      type: 'RagDoll Cat'
    },
  ];

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
