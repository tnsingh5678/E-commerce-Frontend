import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/admin/sidebar';
import { Pencil, Save, Search, ArrowUpDown, Plus } from 'lucide-react';
import { Helmet } from "react-helmet";
import { useParams, useNavigate } from 'react-router-dom';

const Product = () => {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({
    name: '',
    category: '',
    price: '',
    inStockValue: '',
    soldStockValue: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'ascending'
  });

  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    price: '',
    rating: '',
    inStockValue: '',
    soldStockValue: '',
    visibility: true,
    description: '',
    images: []
  });

  const [isAddingProduct, setIsAddingProduct] = useState(false);

  const [description, setDescription] = useState({
    title: '',
    Manufacturer: '',
    manufacturingDate: '',
    warranty: 0,
    Certifications: ''
  });

  const handleDescriptionChange = (e) => {
    const { name, value } = e.target;
    setDescription((prev) => ({ ...prev, [name]: value }));
  };


  useEffect(() => {
    const verifySeller = async () => {
      if (!sellerId) {
        navigate('/seller/login');
        return;
      }

      try {
        const response = await fetch('https://e-commerce-backend-im60.onrender.com/admin/verify-seller', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ sellerId })
        });

        const data = await response.json();

        if (data.loggedIn !== 'loggedin') {
          navigate('/seller/login');
        }
      } catch (error) {
        console.error('Error verifying seller:', error);
        navigate('/seller/login');
      }
    };

    verifySeller();
  }, [sellerId, navigate]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('https://e-commerce-backend-im60.onrender.com/get-product');
      const data = await response.json();
      setProducts(data.products); // Access the products array from response
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleAddProduct = async () => {
    const formData = new FormData();
    formData.append('name', newProduct.name);
    formData.append('price', newProduct.price);
    formData.append('category', newProduct.category);
    formData.append('rating', newProduct.rating);
    formData.append('inStockValue', newProduct.inStockValue);
    formData.append('soldStockValue', newProduct.soldStockValue);
    formData.append('visibility', newProduct.visibility);
    formData.append('description', newProduct.description);
    formData.append('Description', JSON.stringify(description));
    newProduct.images.forEach((image) => {
      
      if (Array.isArray(newProduct.images)) {
        formData.append('images', image);
      } else {
        console.error("m.images is not an array");
      }
    });

    try {
      const response = await fetch('https://e-commerce-backend-im60.onrender.com/upload/addproduct', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        setIsAddingProduct(false);
        fetchProducts(); // Reload the product list
      } else {
        console.error('Error adding product:', data.message);
      }
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      const response = await fetch('https://e-commerce-backend-im60.onrender.com/upload/deleteProduct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productId })
      });

      const data = await response.json();
      if (data.success) {
        fetchProducts(); // Reload the product list
      } else {
        console.error('Error deleting product:', data.message);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleImageChange = (e) => {
    const filesArray = Array.from(e.target.files);
    setNewProduct({ ...newProduct, images: filesArray });
  };

  const handleEdit = (product) => {
    setEditingId(product.productId);
    setEditValues({
      name: product.name || '',
      category: product.category || '',
      price: product.price || 0,
      inStockValue: product.inStockValue || 0,
      soldStockValue: product.soldStockValue || 0
    });
  };

  const handleSave = async (productId) => {
    try {
      const response = await fetch('https://e-commerce-backend-im60.onrender.com/instock-update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId,
          name: editValues.name || '',
          category: editValues.category || '',
          price: editValues.price || 0,
          inStockValue: editValues.inStockValue || 0,
          soldStockValue: editValues.soldStockValue || 0
        })
      });

      if (response.ok) {
        setEditingId(null);
        fetchProducts();
      }
    } catch (error) {
      console.error('Error updating stock values:', error);
    }
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedProducts = React.useMemo(() => {
    if (!Array.isArray(products)) return [];

    let sortableProducts = [...products];
    if (sortConfig.key !== null) {
      sortableProducts.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableProducts;
  }, [products, sortConfig]);

  const filteredProducts = sortedProducts.filter(product =>
    product.productId?.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex">
      <Helmet>
        <title>Products | Admin | Mera Bestie</title>
      </Helmet>
      <Sidebar />
      <div className="flex-1 p-8 ml-[5rem] lg:ml-64 bg-pink-50 min-h-screen">
        <div className="mb-6 flex justify-between items-center">
          <div className="relative">
            <div className={`flex items-center ${isSearchExpanded ? 'w-full md:w-64' : 'w-10 md:w-64'} transition-all duration-300`}>
              <button
                className="md:hidden absolute left-2 z-10"
                onClick={() => setIsSearchExpanded(!isSearchExpanded)}
              >
                <Search size={20} />
              </button>
              <input
                type="text"
                placeholder="Search by product ID or name..."
                className={`pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 ${isSearchExpanded ? 'w-full opacity-100' : 'w-0 md:w-full opacity-0 md:opacity-100'
                  } transition-all duration-300`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {isAddingProduct && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <h2 className="text-xl mb-4">Add New Product</h2>
            <form onSubmit={(e) => e.preventDefault()}>
              <input
                type="text"
                placeholder="Product Name"
                className="w-full border rounded px-4 py-2 mb-4"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              />
              <input
                type="text"
                placeholder="Category"
                className="w-full border rounded px-4 py-2 mb-4"
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
              />
              <input
                type="number"
                placeholder="Price"
                className="w-full border rounded px-4 py-2 mb-4"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              />
              <input
                type="file"
                multiple
                className="w-full mb-4"
                onChange={handleImageChange}
              />
              <textarea
                placeholder="Description"
                className="w-full border rounded px-4 py-2 mb-4"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              />
              <button
                onClick={handleAddProduct}
                className="px-6 py-2 bg-pink-600 text-white rounded hover:bg-pink-700"
              >
                Add Product
              </button>
            </form>
          </div>
        )}

        <button
          onClick={() => setIsAddingProduct(true)}
          className="px-4 py-2 bg-green-600 text-white rounded mb-6 hover:bg-green-700 flex items-center"
        >
          <Plus size={16} className="mr-2" /> Add New Product
        </button>


        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-pink-100">
              <tr>
                <th onClick={() => handleSort('name')} className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer">
                  <div className="flex items-center">
                    Product
                    <ArrowUpDown size={14} className="ml-1" />
                  </div>
                </th>
                <th onClick={() => handleSort('category')} className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer">
                  <div className="flex items-center">
                    Category
                    <ArrowUpDown size={14} className="ml-1" />
                  </div>
                </th>
                <th onClick={() => handleSort('price')} className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer">
                  <div className="flex items-center">
                    Price
                    <ArrowUpDown size={14} className="ml-1" />
                  </div>
                </th>
                <th onClick={() => handleSort('inStockValue')} className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer">
                  <div className="flex items-center">
                    In Stock
                    <ArrowUpDown size={14} className="ml-1" />
                  </div>
                </th>
                <th onClick={() => handleSort('soldStockValue')} className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer">
                  <div className="flex items-center">
                    Sold
                    <ArrowUpDown size={14} className="ml-1" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.productId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingId === product.productId ? (
                      <input
                        type="text"
                        className="w-20 border rounded px-2 py-1"
                        value={editValues.name}
                        onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                      />
                    ) : (
                      product.name || '-'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingId === product.productId ? (
                      <input
                        type="text"
                        className="w-20 border rounded px-2 py-1"
                        value={editValues.category}
                        onChange={(e) => setEditValues({ ...editValues, category: e.target.value })}
                      />
                    ) : (
                      product.category || '-'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingId === product.productId ? (
                      <input
                        type="number"
                        className="w-20 border rounded px-2 py-1"
                        value={editValues.price}
                        onChange={(e) => setEditValues({ ...editValues, price: e.target.value })}
                      />
                    ) : (
                      product.price || '-'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingId === product.productId ? (
                      <input
                        type="number"
                        className="w-20 border rounded px-2 py-1"
                        value={editValues.inStockValue}
                        onChange={(e) => setEditValues({ ...editValues, inStockValue: e.target.value })}
                      />
                    ) : (
                      product.inStockValue || '-'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingId === product.productId ? (
                      <input
                        type="number"
                        className="w-20 border rounded px-2 py-1"
                        value={editValues.soldStockValue}
                        onChange={(e) => setEditValues({ ...editValues, soldStockValue: e.target.value })}
                      />
                    ) : (
                      product.soldStockValue || '-'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingId === product.productId ? (
                      <button
                        onClick={() => handleSave(product.productId)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Save size={18} />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Pencil size={18} />
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingId === product.productId ? (
                      <input
                        type="text"
                        className="w-20 border rounded px-2 py-1"
                        value={editValues.Description?.title}
                        onChange={(e) => setEditValues({ ...editValues, Description: { ...editValues.Description, title: e.target.value } })}
                      />
                    ) : (
                      product.Description?.title || '-'
                    )}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Product;
