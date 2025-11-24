  // Fetch product details from the API
  fetch("https://api.dynamiccorrugations.com/item?id=cm71xrd7z0000jf404ptkahds")
  .then(response => response.json())
  .then(data => {
      // Hide the loading message
      document.getElementById("loading").style.display = "none";
      
      // Get product data from the response
      const product = data.data;
      
      // Populate the product container with the fetched data
      document.getElementById("product-container").style.display = "block";
      document.getElementById("product-image").src = `https://api.dynamiccorrugations.com/${product.images}`;
      document.getElementById("product-name").textContent = product.name;
      document.getElementById("product-description").textContent = product.description;
      document.getElementById("product-dimensions").textContent = `Dimensions: ${product.dimensions}`;
      document.getElementById("product-material").textContent = `Material: ${product.material}`;
      document.getElementById("product-application").textContent = `Application: ${product.application}`;
      document.getElementById("product-eco-friendly").textContent = `Eco-Friendly: ${product.ecoFriendly}`;
      document.getElementById("product-price").textContent = `₹${product.price}`;
  })
  .catch(error => {
      console.error("Error fetching product data:", error);
      document.getElementById("loading").textContent = "Failed to load product details.";
  });