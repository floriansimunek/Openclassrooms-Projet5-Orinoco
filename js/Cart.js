class Cart {
    //Constructor de la class qui nous permet de récupérer les produits dans le panier (localStorage)
    constructor() {
        this.productsInCart = JSON.parse(localStorage.getItem("productsInCart"));
        this.product;
        this.totalPrice = 0;
        this.initialize();
    }

    //Méthode initialize() qui se "lance" à la déclaration de la class Cart (let cart = new Cart())
    initialize() {
        if(localStorage.length > 0){
            for (let i = 0; i < this.productsInCart.length; i++) {
                        //Appel de la class Ajax qui permet de fetch() les informations de chaque "teddy" présent dans le panier depuis l'API
                        let ajaxResponse = new Ajax('http://localhost:3000/api/teddies/' + this.productsInCart[i][0]);

                        //Méthode getResponse() qui permet de récuperer les datas des teddies du panier
                        ajaxResponse.getResponse().then(data => {
                            cart.product = data;
                        }).then(function(){
                            cart.viewInCart(i);
                            if(document.getElementById("display-cart") != null){
                                let productTotalPriceInCart = document.getElementsByClassName("price")[i].textContent;
                                cart.displayTotalPrice(productTotalPriceInCart);
                            }
                        }).then(function(){
                            let productQuantityInCart = document.getElementsByClassName("quantityInputs");
                            let productPriceInCart = document.getElementsByClassName("price");
                            let productTotalPriceInCart = productPriceInCart[i].textContent;
                            for(let y = 0; y < productQuantityInCart.length; y++){
                                let productPrice = productPriceInCart[y].getAttribute('data-price-price');
                                productQuantityInCart[y].addEventListener('input', function(){
                                    productQuantityInCart[i][1] = productQuantityInCart[y].value;
                                    console.log(productQuantityInCart[i][1])
                                    cart.modifyQuantity(productQuantityInCart[i][1], y);
                                    cart.viewPrice(productQuantityInCart[i][1], productPrice, y);
                                    cart.displayTotalPrice(productTotalPriceInCart);
                                })                                
                            }
                        }).then(function(){
                            //Partie qui nous permet de supprimer un élément du panier depuis le button correspondant
                            let btnSupprProductInCart = document.getElementsByClassName("btn_delete");
                            for (let y = 0; y < btnSupprProductInCart.length; y++) {
                                btnSupprProductInCart[y].addEventListener('click', function(e){
                                    let myProductId = this.getAttribute('data-delete-id');
                                    let myProductName = this.getAttribute('data-delete-name');
                                    cart.deleteProductInCart(myProductId, myProductName, y);
                                });
                            }
                        }).then(function(){
                            cart.emptyCart();
                        })
                        .catch(error => {
                            //Récupération des messages d'erreurs en cas de problèmes(s)
                            console.error(error);  
                        })  
            } 
        }

        //On signale à l'utilisateur, par un message, que son panier est vide si le localStorage est vide
        if(document.getElementById('empty-cart') && localStorage.productsInCart === '[]' ||document.getElementById('empty-cart') && localStorage.length === 0){
            this.displayEmptyCart();
        }      
    }

    //Méthode qui nous permet d'afficher chaque produit présent dans le panier
    viewInCart(i){
        //Code HTML permettant d'afficher chaque produit individuellement avec Bootstrap
        let cartCode =  `<tr>
                            <td>
                                <figure class="itemside align-items-center">
                                    <div class="aside col-lg-6"><a href="../pages/view-product.html?product_id=${cart.product._id}"><img src="${cart.product.imageUrl}" class="card-img"></a></div>
                                    <figcaption class="info ml-3 mt-3">
                                        <a href="../pages/view-product.html?product_id=${cart.product._id}" class="text-primary h3">${cart.product.name}</a>
                                        <p class="text-muted" id="product_colors">Couleurs: ${cart.product.colors}</p>
                                    </figcaption>
                                </figure>
                            </td>
                            <td>
                                <input class="quantityInputs form-control" type="number" id="product_quantity_${cart.product._id}" min="1" max="10" value="${cart.productsInCart[i][1]}">
                            </td>
                            <td>
                                <div class="price-wrap"> 
                                    <span  class="price text-primary h4" data-price-price="${cart.product.price}" id="product_price_${cart.product._id}">${cart.product.price * cart.productsInCart[i][1]}€</br></span>
                                    <p class="text-muted">${cart.product.price}€/unité</p>
                                </div>
                            </td>
                                <td class="text-right">
                                <a href="" class="btn btn-danger btn_delete" data-delete-id="${cart.product._id}" data-delete-name="${cart.product.name}">Supprimer</a>
                            </td>
                        </tr>`;

        //On affiche les produits présent dans le panier seulement sur la page dédiée
        if(document.getElementById("display-cart") != null){
            let displayCart = document.getElementById('display-cart');
            displayCart.innerHTML += cartCode;   
        }
    }

    //Méthode qui permet de modifier le prix avec les quantity inputs
    modifyQuantity(quantity, y){
        if(document.getElementById("total_price") != null && document.getElementById("final_price") != null){
            cart.productsInCart[y][1] = quantity;
            localStorage.setItem('productsInCart', JSON.stringify(cart.productsInCart));
        }
    }

    //Méthode qui de modifier le prix du produit en fonction de sa quantité ce qui modifie la valeur finale du panier
    viewPrice(quantity, price, y){  
        if(document.getElementById("total_price") != null && document.getElementById("final_price") != null){
            let productPrice = price * quantity;
            //On multiplie le prix unitaire du produit par sa quantité dans le panier pour avoir le prix total du produit
            let displayedProductPrice = document.getElementById('product_price_' + this.productsInCart[y][0]);
            displayedProductPrice.innerText = JSON.stringify(productPrice) + "€";  
        }
    }

    //Méthode qui nous permet de connaître le prix total du panier et le prix final après réduction si réduction il y a
    displayTotalPrice(productTotalPriceInCart){
        productTotalPriceInCart = productTotalPriceInCart.replace("€", "");
        productTotalPriceInCart = parseInt(productTotalPriceInCart);

        let totalProductsPrice = document.getElementById("total_price");
        //let finalProductsPrice = document.getElementById("final_price");
        
        this.totalPrice += productTotalPriceInCart;
        totalProductsPrice.innerText = this.totalPrice + "€";
    }

    //Méthode qui nous permet d'afficher un message pour signaler à l'utilisateur que son panier est vide
    displayEmptyCart(){
        let emptyCart = document.getElementById('empty-cart');
        emptyCart.classList.add('d-flex', 'justify-content-center');
        emptyCart.innerHTML = '<h2 class="mt-3">Votre panier est vide</h2>';
    }

    //Méthode qui nous permet de supprimer un produit du panier en cliquant sur un button grâce à son ID
    deleteProductInCart(id, name, y){
        if(this.productsInCart[y][0] === id){
            cart.productsInCart.splice(y, 1);
            localStorage.setItem("productsInCart", JSON.stringify(cart.productsInCart));
        }
        alert(`Le produit ${name} est supprimé de votre panier`);
    }

    //Méthode qui permet de vider le panier
    emptyCart(){
       if(document.getElementById('btn_SupprAll') != null){
           let deleteAll = document.getElementById('btn_SupprAll');
           deleteAll.addEventListener('click', function(){
               localStorage.setItem('productsInCart', '[]');
           })
       } 
    }
}