document.addEventListener("DOMContentLoaded", function () {
  const productContainer = document.getElementById("productContainer");
  const gridProductContainer = document.getElementById("gridProductContainer");
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // Update cart UI by checking which products are in the cart
  function updateCartUI() {
    cart.forEach((item) => {
      const viewCartBtn = document.querySelector(`.view-cart[data-id="${item.id}"]`);
      if (viewCartBtn) {
        viewCartBtn.style.display = "inline-block";
      }
    });
  }

  // Function to generate product HTML
  function generateProductHTML(product, index) {
    let imageUrl = product.images ? `https://api.dynamiccorrugations.com/${product.images}` : "placeholder.jpg";
    const productCard = `
      <div class="${index < 6 ? 'swiper-slide' : 'col-md-4 grid-item'}">
        <img src="${imageUrl}" alt="${product.name}">
        <h4 class="heading">${product.name}</h4>
        <p>${product.description}</p>
        <div class="buttons">
          <span class="price">₹${product.price}</span>      
          <span class="price kk">${index < 6 ? '₹' + product.price : ''}</span>
          <a href="product-detail.html" class="customize-link">
            <button class="customize-button" data-id="${product.id}">🎨 Customize</button>
          </a>
        </div>
        <div class="buttons">
          <button class="add-to-cart" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}" data-image="${imageUrl}">Add to Cart</button>
          <button class="view-cart" data-id="${product.id}">View Cart</button>
        </div>
      </div>
    `;
    return productCard;
  }

  // Fetch products from API and render them
  fetch("https://api.dynamiccorrugations.com/items")
    .then((response) => response.json())
    .then((data) => {
      if (!data || !data.data || data.data.length === 0) {
        productContainer.innerHTML = "<p>No products found.</p>";
        gridProductContainer.innerHTML = "<p>No products found.</p>";
        return;
      }

      data.data.forEach((product, index) => {
        const productHTML = generateProductHTML(product, index);
        if (index < 6) {
          productContainer.innerHTML += productHTML;
        } else {
          gridProductContainer.innerHTML += productHTML;
        }
      });

      // Initialize Swiper
      new Swiper(".mySwiper", {
        slidesPerView: 3,
        spaceBetween: 10,
        pagination: {
          el: ".swiper-pagination",
          clickable: true,
        },
        navigation: {
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        },
      });


      document.addEventListener("click", function (event) {
        if (event.target.matches(".customize-button")) {
          const { id, name, price, image } = event.target.dataset;
          console.log("Product data:", { id, name, price, image }); // Debugging line
      
          if (id && name && price && image) {
            localStorage.setItem("selectedProduct", JSON.stringify({ id, name, price, image }));
          } else {
            console.error("Missing product data.");
          }
        }
      });
      
      // Event delegation for click events
      document.addEventListener("click", function (event) {
        const { id, name, price, image } = event.target.dataset;

        if (event.target.matches(".add-to-cart")) {
          addToCart(id, name, parseFloat(price), image);
          event.target.nextElementSibling.style.display = "inline-block";
        }

        if (event.target.matches(".view-cart")) {
          window.location.href = `cart.html?id=${id}`;
        }
        
        if (event.target.matches(".customize-button")) {
          const { id, name, price, image } = event.target.dataset;
          console.log("Product data:", { id, name, price, image }); // Debugging line
      
          if (id && name && price && image) {
            localStorage.setItem("selectedProduct", JSON.stringify({ id, name, price, image }));
          } else {
            console.error("Missing product data.");
          }}
        if (event.target.matches(".customize-button")) {
          localStorage.setItem("selectedProduct", JSON.stringify({ id, name, price, image }));
        }
      });

      updateCartUI();
    })
    .catch((error) => {
      console.error("Error fetching products:", error);
      productContainer.innerHTML = "<p>Failed to load products.</p>";
      gridProductContainer.innerHTML = "<p>Failed to load products.</p>";
    });

  // Function to add product to the cart
  function addToCart(id, name, price, image) {
    const existingProduct = cart.find((item) => item.id === id);
    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      cart.push({ id, name, price, quantity: 1, image });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
  }
});
