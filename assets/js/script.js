class NavigationSystem {
  constructor() {
    // Initialisation des éléments clés du système
    this.sections = Array.from(document.querySelectorAll(".section")); // Liste des sections
    this.navItems = {
      links: Array.from(document.querySelectorAll(".nav-link")), // Liens de navigation
      dots: Array.from(document.querySelectorAll(".nav-dot")), // Points de navigation
    };
    this.currentIndex = 0; // Index de la section active
    this.isTransitioning = false; // Indique si une transition est en cours
    this.scrollTimeout = null; // Timeout pour gérer les événements de défilement
    this.touchStartY = null; // Position initiale du toucher pour les appareils tactiles
    this.logo = document.querySelector(".logo");
    this.init(); // Initialisation du système
  }

  init() {
    this.addEventListeners(); // Ajoute les écouteurs d'événements
    this.handleInitialHash(); // Gère l'URL avec un hash initial (si présent)
    this.animateCards(); // Anime les cartes dans la section active
  }

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

    // Écouteurs pour le changement du lien
    window.addEventListener("hashchange", this.handleHashChange.bind(this));
  }

  handleScroll(e) {
    // Empêche les transitions multiples
    if (this.isTransitioning) return;

    const delta = Math.sign(e.deltaY); // Direction du défilement
    const currentSection = this.sections[this.currentIndex];

    // Vérifie si on peut encore défiler dans la section courante
    if (this.canScroll(currentSection, delta > 0)) {
      return;
    }

    e.preventDefault(); // Empêche le comportement par défaut
    this.changeSection(delta); // Change de section
  }

  handleLogoClick(e) {
    e.preventDefault();
    const targetIndex = 0; // Index de la section "accueil"
    if (targetIndex !== this.currentIndex) {
      this.transitionSections(
        targetIndex,
        targetIndex > this.currentIndex ? 1 : -1
      );
    }
  }

  canScroll(section, isScrollingDown) {
    // Vérifie si on peut défiler à l'intérieur de la section active
    const { scrollTop, scrollHeight, clientHeight } = section;
    const buffer = 50; // Tolérance pour éviter les "rebonds"

    return isScrollingDown
      ? scrollTop + clientHeight < scrollHeight - buffer
      : scrollTop > buffer;
  }

  touchStart(e) {
    // Sauvegarde la position de départ pour les appareils tactiles
    this.touchStartY = e.touches[0].clientY;
  }

  touchEnd(e) {
    if (!this.touchStartY) return;

    // Calcule la distance parcourue par le toucher
    const deltaY = e.changedTouches[0].clientY - this.touchStartY;
    this.changeSection(Math.sign(deltaY) * -1); // Inverse la direction
    this.touchStartY = null; // Réinitialise la position
  }

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

  updateNavItems(index, state) {
    // Met à jour l'état actif des liens et points de navigation
    this.navItems.links[index].classList.toggle("active", state);
    this.navItems.dots[index].classList.toggle("active", state);
  }

  animateCards() {
    // Anime les cartes de la section active
    const cards = this.sections[this.currentIndex].querySelectorAll(".card");
    cards.forEach((card, i) => {
      setTimeout(() => card.classList.add("active"), i * 150);
    });
  }

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

  handleDotClick(e) {
    // Gère le clic sur les points de navigation
    const targetIndex = this.navItems.dots.indexOf(e.target);
    if (targetIndex !== -1) {
      this.transitionSections(
        targetIndex,
        targetIndex > this.currentIndex ? 1 : -1
      );
    }
  }

  handleInitialHash() {
    // Gère le hash dans l'URL au chargement initial
    const hash = window.location.hash.substring(1);
    const targetIndex = this.sections.findIndex((s) => s.id === hash);
    if (targetIndex > -1) {
      this.transitionSections(
        targetIndex,
        targetIndex > this.currentIndex ? 1 : -1
      );
    }
  }

  //Amelioration possible que je n'ai pas reussi a faire fonctionner ( remplacer par le window.addEventListener("hashchange" ...) en dessous )
  handleHashChange() {
    const hash = window.location.hash.substring(1);
    const targetIndex = this.sections.findIndex((s) => s.id === hash);

    if (targetIndex > -1 && targetIndex !== this.currentIndex) {
      this.transitionSections(
        targetIndex,
        targetIndex > this.currentIndex ? 1 : -1
      );
    }
  }

  updateHistory() {
    // Met à jour l'URL avec le hash de la section active
    history.replaceState(null, null, `#${this.sections[this.currentIndex].id}`);
  }
}

// Initialise le système de navigation
new NavigationSystem();

//Gestion du light * dark mode
document.addEventListener("DOMContentLoaded", () => {
  const toggleButton = document.getElementById("dark-mode-toggle");
  const rootElement = document.documentElement; // Sélectionne <html>
  const darkModeEnabled = localStorage.getItem("dark-mode") === "enabled";

  // Fonction pour mettre à jour l'icône
  const updateIcon = () => {
    toggleButton.innerHTML = rootElement.classList.contains("dark-mode")
      ? '<i class="bx bx-sun"></i>' // Icône de soleil pour le mode clair
      : '<i class="bx bx-moon"></i>'; // Icône de lune pour le mode sombre
  };

  // Appliquer le mode sombre si activé précédemment
  if (darkModeEnabled) {
    rootElement.classList.add("dark-mode");
    updateIcon();
  }

  // Gérer le clic sur le bouton
  toggleButton.addEventListener("click", () => {
    if (rootElement.classList.contains("dark-mode")) {
      rootElement.classList.remove("dark-mode");
      localStorage.setItem("dark-mode", "disabled"); // Sauvegarde de la préférence
    } else {
      rootElement.classList.add("dark-mode");
      localStorage.setItem("dark-mode", "enabled"); // Sauvegarde de la préférence
    }
    updateIcon();
  });
});

document.addEventListener("DOMContentLoaded", () => {
  // Définir l'URL de base sans hash ni paramètres
  const baseUrl = window.location.origin + window.location.pathname;

  // Écouter les changements de hash dans l'URL
  window.addEventListener("hashchange", () => {
    if (window.location.hash) {
      // Rediriger vers l'URL de base
      window.location.href = baseUrl;
    }
  });

  // Vérifier l'URL actuelle au chargement de la page
  if (window.location.hash || window.location.search) {
    // Si un hash ou des paramètres sont présents, rediriger vers l'URL de base
    window.location.href = baseUrl;
  }
});
