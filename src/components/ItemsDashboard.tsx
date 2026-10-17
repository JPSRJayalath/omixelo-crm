"use client";

import { useEffect, useState } from "react";
import { getAllCategories, Category, createCategory } from "@/lib/category";
import { getAllProducts, Products } from "@/lib/products";

export default function Items() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Products[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState<number>(0);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [categoryInput, setCategoryInput] = useState<string>("");
    const [productInput, setProductInput] = useState<string>("");
    const [selectProduct, setSelectProduct] = useState<string>("");

    // Add states for the remaining product fields
    const [pStock, setPStock] = useState<number | string>("");
    const [pPrice, setPPrice] = useState<number | string>("");
    const [pDescription, setPDescription] = useState<string>("");

    // Handler to auto-fill fields when an existing product is selected
    const handleProductSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedName = e.target.value;
        setProductInput(selectedName);

        // Search for the product in your `products` state array
        const foundProduct = products.find(
            (prod) => prod.pName.toLowerCase() === selectedName.toLowerCase()
        );

        if (foundProduct) {
            setSelectProduct(foundProduct.pName);
            setPStock(foundProduct.pStock ?? "");
            setPPrice(foundProduct.pPrice ?? "");
            setPDescription(foundProduct.pDescribe ?? "");

            // If your Products type stores categoryName directly:
            if ("categoryName" in foundProduct && foundProduct.categoryName) {
                setCategoryInput(String(foundProduct.categoryName));
            } 
            // Or if your Products type stores categoryId, match it with `categories`:
            else if ("categoryId" in foundProduct) {
                const matchedCat = categories.find(
                    (cat) => cat.categoryId === foundProduct.categoryId
                );
                setCategoryInput(matchedCat ? matchedCat.categoryName : "");
            }
        }
    };

    function handleProductsManagementPanel(param: number){
        if (param === 0){
            document.getElementById("productsManagementPanel")!.style.display = "flex";
            document.getElementById("addTitle")!.style.display = "flex";
            document.getElementById("itemSection")!.style.display = "none";
            document.getElementById("updateTitle")!.style.display = "none";
            document.getElementById("removeTitle")!.style.display = "none";
            document.getElementById("productSelecterLabel")!.style.display = "none";
            document.getElementById("productSelecter")!.style.display = "none";
            document.getElementById("formUpdate")!.style.display = "none";
            document.getElementById("formAdd")!.style.display = "flex";
            document.getElementById("formRemove")!.style.display = "none";
            return;
        }

        else if (param === 1){
            document.getElementById("productsManagementPanel")!.style.display = "flex";
            document.getElementById("updateTitle")!.style.display = "flex";
            document.getElementById("itemSection")!.style.display = "none";
            document.getElementById("addTitle")!.style.display = "none";
            document.getElementById("removeTitle")!.style.display = "none";
            document.getElementById("productSelecterLabel")!.style.display = "flex";
            document.getElementById("productSelecter")!.style.display = "flex";
            document.getElementById("formUpdate")!.style.display = "flex";
            document.getElementById("formAdd")!.style.display = "none";
            document.getElementById("formRemove")!.style.display = "none";
            return;
        }
        
        else if (param === 2){
            document.getElementById("productsManagementPanel")!.style.display = "flex";
            document.getElementById("updateTitle")!.style.display = "none";
            document.getElementById("itemSection")!.style.display = "none";
            document.getElementById("addTitle")!.style.display = "none";
            document.getElementById("removeTitle")!.style.display = "flex";
            document.getElementById("productSelecterLabel")!.style.display = "flex";
            document.getElementById("productSelecter")!.style.display = "flex";
            document.getElementById("formUpdate")!.style.display = "none";
            document.getElementById("formAdd")!.style.display = "none";
            document.getElementById("formRemove")!.style.display = "flex";
            return;
        }

        else if (param === 3){
            document.getElementById("itemSection")!.style.display = "flex";
            document.getElementById("productsManagementPanel")!.style.display = "none";
            setCategoryInput("");
            setProductInput("");
            setPDescription("");
            setSelectProduct("");
            setPPrice("");
            setPStock("");
            return;
        }
    }

    useEffect(() => {
        async function loadCategories() {
            try {
                const data = await getAllCategories();
                console.log("Fetched categories from DB:", data); // Check the browser console!
                setCategories(data);
            } catch (error: any) {
                const msg = error.message || "Failed to connect to the database.";
                setErrorMessage(msg);
                console.error(msg);
            }
        }
        loadCategories();
    }, []);

    useEffect(() => {
        async function loadProducts() {
            try {
                const data = await getAllProducts();
                console.log("Fetched products from DB:", data);
                setProducts(data);
            } catch (error: any) {
                const msg = error.message || "Failed to connect to the database.";
                setErrorMessage(msg);
                console.log(msg);
            }
        }
        loadProducts();
    }, [])

    return (
        <>
            <section id="itemSection" className="itemSection">
                <div className="searchControlers">
                    <div className="search">
                        <input type="text" placeholder="Search by name or ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <div className="controlButtons">
                        <button type="button" onClick={() => handleProductsManagementPanel(0)}>Add</button>
                        <button type="button" onClick={() => handleProductsManagementPanel(1)}>Update</button>
                        <button type="button" onClick={() => handleProductsManagementPanel(2)}>Delete</button>
                    </div>
                </div>
                <div className="category">
                    <ul className="categoryList">
                        <li><button value={0} onClick={() => setActiveCategory(0)} className={activeCategory === 0 ? "active" : ""}>All</button></li>
                        {categories.map((cat) => (
                            <li key={cat.categoryId}>
                                <button value={cat.categoryId} onClick={() => setActiveCategory(cat.categoryId)} className={cat.categoryId === activeCategory ? "active" : ""}>{cat.categoryName}</button>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="itemTable">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Product</th>
                                <th>Stock</th>
                                <th>Pre. Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.filter((prod) => {
                                const matchesCategory = activeCategory === 0 || activeCategory === prod.categoryId;
                                const matchesSearch = prod.pName.toLowerCase().includes(searchTerm.toLowerCase()) || String(prod.pId).toLowerCase().includes(searchTerm.toLowerCase());
                                return matchesCategory && matchesSearch;
                                }).map((prod) => (
                                    <tr key={prod.pId}>
                                        <td>{prod.pId}</td>
                                        <td>{prod.pName}</td>
                                        <td>{prod.pStock}</td>
                                        <td>{prod.pPrice}</td>
                                    </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
            <section id="productsManagementPanel" className="productsManagementPanel">
                <div className="addItemContainer">
                    <div className="addItemForm">
                        <div className="title">
                            <h2 id="addTitle" className="addTitle">Add Product</h2>
                            <h2 id="updateTitle" className="updateTitle">Update Product Details</h2>
                            <h2 id="removeTitle" className="removeTitle">Remove Product</h2>
                        </div>
                        <div className="form">
                            <form action="">
                                <div className="image">
                                    <div className="imagePreview">

                                    </div>
                                </div>
                                <div className="formInfo">
                                    <div className="formLeftPanel">
                                        <div id="productSelecterLabel">
                                            <label className="selecteProductUpdate" htmlFor="pName">Select a Product</label>
                                        </div>
                                        <div>
                                            <label htmlFor="pName">Product Name</label>
                                        </div>
                                        <div>
                                            <label htmlFor="pStock">Product Stock</label>
                                        </div>
                                        <div>
                                            <label htmlFor="pPrice">Product Price</label>
                                        </div>
                                        <div>
                                            <label htmlFor="pDescription">Product Description</label>
                                        </div>
                                        <div>
                                            <label htmlFor="pCategory">Product Category</label>
                                        </div>
                                    </div>
                                    <div className="formRightPanel">
                                        <div id="productSelecter">
                                            <input
                                                type="text"
                                                name="pNameSearch"
                                                id="pNameSearch"
                                                placeholder="Product Name"
                                                list="product-options"
                                                value={productInput}
                                                onChange={handleProductSelect}
                                            />
                                            <datalist id="product-options">
                                                {products.map((prod) => (
                                                    <option key={prod.pId} value={prod.pName}></option>
                                                ))}
                                            </datalist>
                                        </div>
                                        <div>
                                            <input type="text" name="pName" id="pName" placeholder="Product Name" list="product-options"  value={selectProduct} onChange={(e) => setSelectProduct(e.target.value)} required/>
                                            <datalist>
                                                {products.map((prod) => (
                                                    <option key={prod.pId} value={prod.pName}></option>
                                                ))}
                                            </datalist>
                                        </div>
                                        <div>
                                            <input type="number" name="pStock" id="pStock" placeholder="Product Stock" value={pStock} onChange={(e) => setPStock(e.target.value)} required/>
                                        </div>
                                        <div>
                                            <input type="number" name="pPrice" id="pPrice" placeholder="Product Price" value={pPrice} onChange={(e) => setPPrice(e.target.value)} required/>
                                        </div>
                                        <div>
                                            <input type="text" name="pDescription" id="pDescription" placeholder="Product Description" value={pDescription} onChange={(e) => setPDescription(e.target.value)} required/>
                                        </div>
                                        <div style={{ display: "inline-flex", gap: "8px", alignItems: "center" }}>
                                            <input
                                                list="category-options"
                                                placeholder="Select or type category..."
                                                value={categoryInput}
                                                onChange={(e) => setCategoryInput(e.target.value)}
                                                required
                                            />
                                            <datalist className="category-options" id="category-options">
                                                {categories.map((cat) => (
                                                    <option key={cat.categoryId} value={cat.categoryName} />
                                                ))}
                                            </datalist>
                                        </div>
                                        <div className="formOperateBtn">
                                            <div>
                                                <button id="formAdd" className="formBtn">Add Product</button>
                                            </div>
                                            <div>
                                                <button id="formUpdate" className="formBtn">Update Details</button>
                                            </div>
                                            <div>
                                                <button id="formRemove" className="formBtn">Remove Product</button>
                                            </div>
                                            <div>
                                                <button id="formCancel" className="formBtn fCancel" onClick={() => handleProductsManagementPanel(3)}>Cancel</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}