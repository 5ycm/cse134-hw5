const DOG_API_URL = "https://dog.ceo/api/breeds/image/random";


class DogPanel extends HTMLElement {
  static get observedAttributes() {
    return ["compact"];
  }

  constructor() {
    super();
    this.dogs = [];
    this.isLoading = false;
    this.built = false;
    this.pendingDog = null;

    this.handleButtonClick = this.handleButtonClick.bind(this);
    this.handleImageLoad = this.handleImageLoad.bind(this);
    this.handleImageError = this.handleImageError.bind(this);
  }

  connectedCallback() {
    if (this.built) return;
    this.built = true;
    this.buildInterface();
    this.updateMode();
  }

  disconnectedCallback() {
    if (!this.built) return;
    this.button.removeEventListener("click", this.handleButtonClick);
    this.image.removeEventListener("load", this.handleImageLoad);
    this.image.removeEventListener("error", this.handleImageError);
    this.built = false;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "compact" && this.built) {
      this.updateMode();
    }
  }

  buildInterface() {
    this.replaceChildren();

    const panel = document.createElement("section");
    panel.className = "dog-panel";
    panel.setAttribute("aria-labelledby", "dog-panel-heading");

    const heading = document.createElement("h3");
    heading.id = "dog-panel-heading";
    heading.textContent = "Dog of the Moment";

    const intro = document.createElement("p");
    intro.className = "dog-panel__intro";
    intro.textContent = "Need a break? Fetch a random good dog.";

    this.figure = document.createElement("figure");
    this.figure.className = "dog-panel__figure";

    this.image = document.createElement("img");
    this.image.className = "dog-panel__image";
    this.image.hidden = true;
    this.image.addEventListener("load", this.handleImageLoad);
    this.image.addEventListener("error", this.handleImageError);

    this.placeholder = document.createElement("p");
    this.placeholder.className = "dog-panel__placeholder";
    this.placeholder.textContent = "No dog yet. Press the button below!";

    this.caption = document.createElement("figcaption");
    this.caption.className = "dog-panel__details";

    this.figure.append(this.placeholder, this.image, this.caption);

    this.button = document.createElement("button");
    this.button.type = "button";
    this.button.className = "dog-panel__button";
    this.button.textContent = "Surprise me with a dog";
    this.button.addEventListener("click", this.handleButtonClick);

    this.status = document.createElement("p");
    this.status.className = "dog-panel__status";
    this.status.setAttribute("role", "status");
    this.status.textContent = "Ready.";

    panel.append(heading, intro, this.figure, this.button, this.status);
    this.appendChild(panel);
  }

  updateMode() {
    const compact = this.hasAttribute("compact");
    this.caption.hidden = compact;
    this.classList.toggle("is-compact", compact);
  }

  handleButtonClick() {
    this.loadDog();
  }

  async loadDog() {
    if (this.isLoading) return;
    this.setLoading(true);
    this.setStatus("Fetching a dog…", "loading");

    try {
      const response = await fetch(DOG_API_URL);

      if (!response.ok) {
        throw new Error(`HTTP status ${response.status}`);
      }

      const data = await response.json();

      if (data?.status !== "success" || typeof data?.message !== "string") {
        throw new Error("Unexpected response from the Dog API.");
      }

      const url = this.validateImageUrl(data.message);
      this.pendingDog = { url, breed: this.breedFromUrl(url) };

      this.image.src = url.href;
    } catch (error) {
      console.error("Could not load a dog.", error);
      this.showFailure();
    }
  }

  validateImageUrl(text) {
    let url;
    try {
      url = new URL(text);
    } catch {
      throw new Error("The API did not return a valid URL.");
    }
    if (url.protocol !== "https:" || url.hostname !== "images.dog.ceo") {
      throw new Error(`Refusing image from ${url.origin}`);
    }
    return url;
  }

  breedFromUrl(url) {
    const parts = url.pathname.split("/");
    const slug = parts[2] ?? "";
    if (!slug) return "Unknown breed";
    return slug.split("-").reverse().map(capitalizeWord).join(" ");
  }

  handleImageLoad() {
    if (!this.pendingDog) return;
    const { url, breed } = this.pendingDog;
    this.pendingDog = null;

    this.dogs.push(url.href);
    this.image.alt = `A random photo of a dog. Breed: ${breed}.`;
    this.image.hidden = false;
    this.placeholder.hidden = true;

    this.caption.textContent = `Breed: ${breed} · Dog ${this.dogs.length} this visit`;

    this.setStatus(`Loaded dog ${this.dogs.length}: ${breed}.`, "success");
    this.setLoading(false);
  }

  handleImageError() {
    if (!this.pendingDog) return;
    this.pendingDog = null;
    this.showFailure();
  }

  showFailure() {
    this.setStatus(
      "Couldn't load a dog. Check your connection and try again.",
      "error"
    );
    this.button.textContent = "Try again";
    this.setLoading(false);
  }

  setLoading(loading) {
    this.isLoading = loading;
    this.button.disabled = loading;
    this.setAttribute("aria-busy", String(loading));
    if (!loading && this.dataset.state !== "error") {
      this.button.textContent = "Surprise me with a dog";
    }
  }

  setStatus(message, state) {
    this.status.textContent = message;
    this.dataset.state = state;
  }
}

function capitalizeWord(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

customElements.define("dog-panel", DogPanel);

const MODE_KEY = "hw5-dog-panel-mode";
const MODES = ["compact", "expanded"];
const DEFAULT_MODE = "expanded";

function readSavedMode() {
  try {
    const saved = localStorage.getItem(MODE_KEY);
    return MODES.includes(saved) ? saved : DEFAULT_MODE;
  } catch (error) {
    console.warn("Could not read the dog panel preference.", error);
    return DEFAULT_MODE;
  }
}

function saveMode(mode) {
  try {
    localStorage.setItem(MODE_KEY, mode);
  } catch (error) {
    console.warn("Could not save the dog panel preference.", error);
  }
}

function applyMode(panel, toggle, mode) {
  const compact = mode === "compact";
  panel.toggleAttribute("compact", compact);
  toggle.setAttribute("aria-pressed", String(compact));
  toggle.textContent = compact ? "Show dog details" : "Hide dog details";
}

function handleModeToggleClick() {
  const panel = document.querySelector("dog-panel");
  const toggle = document.querySelector("#dog-panel-mode");
  const next = panel.hasAttribute("compact") ? "expanded" : "compact";
  applyMode(panel, toggle, next);
  saveMode(next);
}

function setUpModeToggle() {
  const panel = document.querySelector("dog-panel");
  const toggle = document.querySelector("#dog-panel-mode");
  if (!panel || !toggle) return;

  toggle.hidden = false;
  applyMode(panel, toggle, readSavedMode());
  toggle.addEventListener("click", handleModeToggleClick);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setUpModeToggle);
} else {
  setUpModeToggle();
}
