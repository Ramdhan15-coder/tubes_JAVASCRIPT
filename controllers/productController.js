const Product = require('../models/Product.js');
const Review = require('../models/Review.js'); 

const productController = {
  showProductDetail: async (req, res) => {
    try {
      const productId = req.params.id;
      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).send('Maaf Bro, produk yang lo cari nggak ada.');
      }
      const reviews = await Review.findByProductId(productId);
      const loggedInUser = req.session.user ? req.session.user.username : null;
      const userId = req.session.user ? req.session.user.userId : null;

      res.render('produk/detail_produk', {
        title: product.name,
        product: product,
        reviews: reviews,
        username: loggedInUser,
        currentUserId: userId
      });
    } catch (error) {
      console.error("Error saat menampilkan detail produk:", error);
      res.status(500).send('Duh, ada masalah pas mau nampilin detail produknya, Bro.');
    }
  }
  
};
module.exports = productController;