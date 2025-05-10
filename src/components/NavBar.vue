<script setup>
    
  const navItems = [
    { title: 'Don. por campaña', path: '/campaign-donations' },
    { title: 'Don. en tendencia', path: '/trending-donations' },
    { title: 'Participacion', path: '/volunteer-participations'},
    { title: 'Dist. de donadores', path: '/donors-distribution' },
    { title: 'Eficiencia', path: '/campaign-efficiency'}
  ];
  

  </script>

<template>
    <nav class="navbar">
      <div class="navbar-container">
        <ul class="navbar-menu">
          <li v-for="(item, index) in navItems" :key="index">
            <router-link 
              :to="item.path" 
              class="nav-link"
            >
              {{ item.icon }} {{ item.title }}
            </router-link>
          </li>
        </ul>
      </div>
    </nav>
  </template>

  
  <style scoped>
  .navbar {
    width: 100%;
    position: fixed;
    background: #343a3f;
    color: var(--color-text);
    padding: 1rem 2rem;
    box-shadow: 2px 2px 5px 2px rgba(0,0,0,0.75);
    z-index: 10;
  }
  
  .navbar-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .navbar-brand {
    font-size: 1.5rem;
    font-weight: bold;
    color: white;
    text-decoration: none;
  }
  
  /* Menú para desktop */
  .navbar-menu {
    display: flex;
    gap: 1.5rem;
    list-style: none;
  }
  
  .nav-link {
    text-align: center;
    color: var(--color-text);
    text-decoration: none;
    font-weight: 500;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    transition: all 0.3s ease;
  }
  
  .nav-link:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }
  
  </style>
