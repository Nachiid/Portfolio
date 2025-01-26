class NavigationSystem {
  constructor() {
    // Initialisation des éléments clés du système
    this.sections = Array.from(document.querySelectorAll(".section")); // Liste des sections de la page
    this.navItems = {
      links: Array.from(document.querySelectorAll(".nav-link")), // Liens de navigation dans la barre de navigation
      dots: Array.from(document.querySelectorAll(".nav-dot")), // Points de navigation (dots)
    };
    this.currentIndex = 0; // Index de la section actuellement active
    this.isTransitioning = false; // Indique si une transition entre sections est en cours
    this.scrollTimeout = null; // Timeout pour gérer les événements de défilement
    this.touchStartY = null; // Position initiale du toucher pour les appareils tactiles
    this.logo = document.querySelector(".logo"); // Sélectionne le logo pour gérer les clics
    this.init(); // Appelle la méthode d'initialisation
  }

  // Méthode d'initialisation du système
  init() {
    this.addEventListeners(); // Ajoute les écouteurs d'événements
    this.handleInitialHash(); // Gère l'URL avec un hash initial (si présent)
    this.animateCards(); // Anime les cartes dans la section active
  }

  // Ajoute les écouteurs d'événements pour les interactions utilisateur
  addEventListeners() {
    // Écouteur pour le défilement à la molette
    window.addEventListener("wheel", this.handleScroll.bind(this), {
      passive: false,
    });

    // Écouteur pour le clic sur le logo
    this.logo.addEventListener("click", (e) => this.handleLogoClick(e));
    // Écouteurs pour les interactions tactiles (mobile)
    window.addEventListener("touchstart", (e) => this.touchStart(e));
    window.addEventListener("touchend", (e) => this.touchEnd(e));

    // Écouteurs pour les clics sur les liens de navigation
    this.navItems.links.forEach((link) =>
      link.addEventListener("click", (e) => this.handleNavClick(e))
    );

    // Écouteurs pour les clics sur les points de navigation
    this.navItems.dots.forEach((dot) =>
      dot.addEventListener("click", (e) => this.handleDotClick(e))
    );
  }

  // Gère le défilement de la molette
  handleScroll(e) {
    // Empêche les transitions multiples
    if (this.isTransitioning) return;

    const delta = Math.sign(e.deltaY); // Direction du défilement (1 pour vers le bas, -1 pour vers le haut)
    const currentSection = this.sections[this.currentIndex];

    // Vérifie si on peut encore défiler dans la section courante
    if (this.canScroll(currentSection, delta > 0)) {
      return;
    }

    e.preventDefault(); // Empêche le comportement par défaut du défilement
    this.changeSection(delta); // Change de section en fonction de la direction du défilement
  }

  // Gère le clic sur le logo
  handleLogoClick(e) {
    e.preventDefault();
    const targetIndex = 0; // Index de la section "accueil"
    if (targetIndex !== this.currentIndex) {
      this.transitionSections(targetIndex, targetIndex > this.currentIndex ? 1 : -1);
    }
  }

  // Vérifie si on peut défiler à l'intérieur de la section active
  canScroll(section, isScrollingDown) {
    const { scrollTop, scrollHeight, clientHeight } = section;
    const buffer = 50; // Tolérance pour éviter les "rebonds"

    return isScrollingDown
      ? scrollTop + clientHeight < scrollHeight - buffer
      : scrollTop > buffer;
  }

  // Gère le début d'un toucher sur un appareil tactile
  touchStart(e) {
    this.touchStartY = e.touches[0].clientY; // Sauvegarde la position de départ du toucher
  }

  // Gère la fin d'un toucher sur un appareil tactile
  touchEnd(e) {
    if (!this.touchStartY) return;

    // Calcule la distance parcourue par le toucher
    const deltaY = e.changedTouches[0].clientY - this.touchStartY;
    this.changeSection(Math.sign(deltaY) * -1); // Inverse la direction pour correspondre au défilement
    this.touchStartY = null; // Réinitialise la position de départ
  }

  // Change de section en fonction de la direction
  changeSection(direction) {
    // Empêche les changements multiples pendant une transition
    if (this.isTransitioning) return;

    // Calcule le nouvel index de la section
    const newIndex = Math.max(
      0,
      Math.min(this.currentIndex + direction, this.sections.length - 1)
    );

    if (newIndex !== this.currentIndex) {
      this.transitionSections(newIndex, direction); // Transition vers la nouvelle section
    }
  }

  // Transition entre les sections
  transitionSections(newIndex, direction) {
    this.isTransitioning = true; // Indique qu'une transition est en cours
    const currentSection = this.sections[this.currentIndex];
    const newSection = this.sections[newIndex];

    // Supprime la classe "active" de la section actuelle
    currentSection.classList.remove("active");
    this.updateNavItems(this.currentIndex, false); // Met à jour l'état des éléments de navigation

    // Ajoute une classe pour la direction (next ou prev)
    newSection.classList.add(direction > 0 ? "next" : "prev");

    setTimeout(() => {
      // Retire les classes directionnelles et active la nouvelle section
      newSection.classList.remove("next", "prev");
      newSection.classList.add("active");
      newSection.scrollTop = 0; // Réinitialise le défilement de la nouvelle section

      this.currentIndex = newIndex; // Met à jour l'index courant
      this.updateNavItems(newIndex, true); // Met à jour l'état des éléments de navigation
      this.animateCards(); // Anime les cartes de la nouvelle section
      this.updateHistory(); // Met à jour l'URL avec le hash de la section active

      // Réinitialise la transition après un délai
      setTimeout(() => (this.isTransitioning = false), 500);
    }, 10);
  }

  // Met à jour l'état actif des liens et points de navigation
  updateNavItems(index, state) {
    this.navItems.links[index].classList.toggle("active", state);
    this.navItems.dots[index].classList.toggle("active", state);
  }

  // Anime les cartes de la section active
  animateCards() {
    const cards = this.sections[this.currentIndex].querySelectorAll(".card");
    cards.forEach((card, i) => {
      setTimeout(() => card.classList.add("active"), i * 150);
    });
  }

  // Gère le clic sur les liens de navigation
  handleNavClick(e) {
    e.preventDefault(); // Empêche le comportement par défaut du lien
    const targetIndex = this.navItems.links.indexOf(e.target);
    if (targetIndex !== -1) {
      this.transitionSections(
        targetIndex,
        targetIndex > this.currentIndex ? 1 : -1
      );
    }
  }

  // Gère le clic sur les points de navigation
  handleDotClick(e) {
    const targetIndex = this.navItems.dots.indexOf(e.target);
    if (targetIndex !== -1) {
      this.transitionSections(
        targetIndex,
        targetIndex > this.currentIndex ? 1 : -1
      );
    }
  }

  // Gère le hash dans l'URL au chargement initial
  handleInitialHash() {
    const hash = window.location.hash.substring(1);
    const targetIndex = this.sections.findIndex((s) => s.id === hash);
    if (targetIndex > -1) {
      this.transitionSections(
        targetIndex,
        targetIndex > this.currentIndex ? 1 : -1
      );
    }
  }

  // Met à jour l'URL avec le hash de la section active
  updateHistory() {
    history.replaceState(null, null, `#${this.sections[this.currentIndex].id}`);
  }
}

// Initialise le système de navigation
new NavigationSystem();