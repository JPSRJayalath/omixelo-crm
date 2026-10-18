"use client";

import { useEffect, useState } from "react";
import { getAllCategories, Category, createCategory } from "@/lib/category";
import { getAllProducts, Products, createProduct, updateProduct, removeProduct } from "@/lib/products";
import { useWebSocket } from "@/context/WebSocketContext";
import Image from "next/image";

export default function Items() {
    const { categories: wsCategories, products: wsProducts, refreshItems } = useWebSocket();
    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Products[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState<number>(0);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [productInput, setProductInput] = useState<string>("");
    const [selectProduct, setSelectProduct] = useState<string>("");
    const [categoryInput, setCategoryInput] = useState<string>("");
    const [pStock, setPStock] = useState<number | string>("");
    const [pPrice, setPPrice] = useState<number | string>("");
    const [pDescription, setPDescription] = useState<string>("");
    const [pName, setPName] = useState<string>("");
    const [pImage, setPImage] = useState<Uint8Array | null>(null);
    const [dbProductAddingError, setDbProductAddingError] = useState<boolean>(false);
    const [dbProductUpdatingError, setDbProductUpdatingError] = useState<boolean>(false);
    const [dbProductRemovingError, setDbProductRemovingError] = useState<boolean>(false);
    const [dbCategoryAddingError, setDbCategoryAddingError] = useState<boolean>(false);
    const [formOperationBtnValue, setFormOperationBtnValue] = useState<string | null>(null);
    const [confirmPanelActive, setConfirmPanelActive] = useState<Boolean>(false);
    const [productsManagementOpenPanel, setProductsManagementOpenPanel] = useState<string | null>(null);
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
    const [dbProcessStatus, setDbProcessStatus] = useState<string | null>(null);

    const handleOpenConfirm = (
        e: React.MouseEvent<HTMLButtonElement>,
        operation: "add" | "update" | "remove"
    ) => {
        const form = e.currentTarget.form;

        if (form && !form.reportValidity()) {
            return;
        }

        if ((operation === "update" || operation === "remove") && !selectedProductId) {
            setErrorMessage("Please select a product first.");
            alert("Please select a product from the list first.");
            return;
        }

        setFormOperationBtnValue(operation);
        setDbProcessStatus("waiting");
        setConfirmPanelActive(true);
    };


    const handleProductSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedName = e.target.value;
        setProductInput(selectedName);

        const foundProduct = products.find(
            (prod) => prod.pName.toLowerCase() === selectedName.toLowerCase()
        );

        if (foundProduct) {
            setSelectedProductId(foundProduct.pId);
            setSelectProduct(foundProduct.pName);
            setPName(foundProduct.pName);
            setPStock(foundProduct.pStock ?? "");
            setPPrice(foundProduct.pPrice ?? "");
            setPDescription(foundProduct.pDescribe ?? "");

            if ("categoryName" in foundProduct && foundProduct.categoryName) {
                setCategoryInput(String(foundProduct.categoryName));
            }
            else if ("categoryId" in foundProduct) {
                const matchedCat = categories.find(
                    (cat) => cat.categoryId === foundProduct.categoryId
                );
                setCategoryInput(matchedCat ? matchedCat.categoryName : "");
            }
        } else {
            setSelectedProductId(null);
            setSelectProduct("");
            setPName("");
            setPStock("");
            setPPrice("");
            setPDescription("");
            setCategoryInput("");
        }
    };

    function handleProductsManagementPanel(param: number) {
        if (param === 0) {
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

        else if (param === 1) {
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

        else if (param === 2) {
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

        else if (param === 3) {
            document.getElementById("itemSection")!.style.display = "flex";
            document.getElementById("productsManagementPanel")!.style.display = "none";
            setCategoryInput("");
            setProductInput("");
            setPName("");
            setPDescription("");
            setSelectProduct("");
            setPPrice("");
            setPStock("");
            setSelectedProductId(null);
            setProductsManagementOpenPanel(null);
            setConfirmPanelActive(false);
            setDbProcessStatus(null);
            setFormOperationBtnValue(null);
            return;
        }
    }

    async function verifyCategoryExists(categoryName: string): Promise<number | undefined> {
        try {
            const selectedCategory = categories.find((cat) => cat.categoryName.toLowerCase() === categoryName.toLowerCase());
            console.log(selectedCategory);
            if (selectedCategory) {
                console.log(`Name: ${pName}, Stock: ${pStock}, Price: ${pPrice}, Description: ${pDescription}, Category: ${categoryName}`);
                return selectedCategory.categoryId;
            }

            else {
                try {
                    const createCategoryResults = await createCategory(categoryName);
                    setCategories(await getAllCategories());
                    refreshItems();
                    return createCategoryResults;
                }
                catch (error: any) {
                    const msg = error.message || "Failed to connect to the database.";
                    setErrorMessage(msg);
                    setDbCategoryAddingError(true);
                }
            }
        } catch (error: any) {
            console.error(error);
        }
    }

    async function handleAddProduct() {
        try {
            const categoryId = await verifyCategoryExists(categoryInput);
            if (!categoryId) {
                throw new Error(`Category "${categoryInput}" does not exist.`);
            }

            try {
                const productCreateResult = await createProduct({
                    pName: pName,
                    pImage: pImage,
                    pDescribe: pDescription,
                    pPrice: Number(pPrice),
                    pStock: Number(pStock),
                    categoryId: Number(categoryId)
                });
                setProducts(await getAllProducts());
                refreshItems();
                setDbProcessStatus("success");
                setTimeout(() => {
                    handleProductsManagementPanel(3);
                }, 2000);
            }

            catch (err: any) {
                const msg = err.message || "Failed to connect to the database.";
                setErrorMessage(msg);
                setDbProductAddingError(true);
                setDbProcessStatus("error");
                setTimeout(() => {
                    setConfirmPanelActive(false);
                    setDbProcessStatus(null);
                }, 2500);
            }

        }

        catch (err: any) {
            const msg = err.message || "Failed to connect to the database.";
            setErrorMessage(msg);
            setDbProductAddingError(true);
            setDbProcessStatus("error");
            setTimeout(() => {
                setConfirmPanelActive(false);
                setDbProcessStatus(null);
            }, 2500);
        }
    }

    async function handleUpdateProduct() {
        try {
            if (!selectedProductId) {
                throw new Error("Please select a product to update.");
            }

            const categoryId = await verifyCategoryExists(categoryInput);
            if (!categoryId) {
                throw new Error(`Category "${categoryInput}" does not exist.`);
            }

            try {
                const productCreateResult = await updateProduct({
                    pName: pName,
                    pImage: pImage,
                    pDescribe: pDescription,
                    pPrice: Number(pPrice),
                    pStock: Number(pStock),
                    categoryId: Number(categoryId),
                    pId: Number(selectedProductId)
                });
                setProducts(await getAllProducts());
                refreshItems();
                setDbProcessStatus("success");
                setTimeout(() => {
                    handleProductsManagementPanel(3);
                }, 2000);
            }

            catch (err: any) {
                const msg = err.message || "Failed to connect to the database.";
                setErrorMessage(msg);
                setDbProductUpdatingError(true);
                setDbProcessStatus("error");
                setTimeout(() => {
                    setConfirmPanelActive(false);
                    setDbProcessStatus(null);
                }, 2500);
            }

        }

        catch (err: any) {
            const msg = err.message || "Failed to connect to the database.";
            setErrorMessage(msg);
            setDbProductUpdatingError(true);
            setDbProcessStatus("error");
            setTimeout(() => {
                setConfirmPanelActive(false);
                setDbProcessStatus(null);
            }, 2500);
        }
    }

    async function handleRemoveProduct() {
        try {
            if (!selectedProductId) {
                throw new Error("Please select a product to remove.");
            }

            const removeProductResult = await removeProduct(Number(selectedProductId));
            setProducts(await getAllProducts());
            refreshItems();
            setDbProcessStatus("success");
            setTimeout(() => {
                handleProductsManagementPanel(3);
            }, 2000);
        }

        catch (err: any) {
            const msg = err.message || "Failed to connect to the database.";
            setErrorMessage(msg);
            setDbProductRemovingError(true);
            setDbProcessStatus("error");
            setTimeout(() => {
                setConfirmPanelActive(false);
                setDbProcessStatus(null);
            }, 2500);
        }
    }


    // Real-time synchronization via WebSocket
    useEffect(() => {
        if (wsCategories && wsCategories.length > 0) {
            setCategories(wsCategories);
        }
    }, [wsCategories]);

    useEffect(() => {
        if (wsProducts && wsProducts.length > 0) {
            setProducts(wsProducts);
        }
    }, [wsProducts]);

    // Initial load fallback
    useEffect(() => {
        let isMounted = true;
        getAllCategories().then((data) => {
            if (isMounted && data) setCategories(data);
        }).catch(() => {});

        getAllProducts().then((data) => {
            if (isMounted && data) setProducts(data);
        }).catch(() => {});

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <>
            <section id="itemSection" className="itemSection">
                <div className="searchControlers">
                    <div className="search">
                        <input type="text" placeholder="Search by name or ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <div className="controlButtons">
                        <button type="button" onClick={() => { handleProductsManagementPanel(0); setProductsManagementOpenPanel("add"); }}>Add</button>
                        <button type="button" onClick={() => { handleProductsManagementPanel(1); setProductsManagementOpenPanel("update"); }}>Update</button>
                        <button type="button" onClick={() => { handleProductsManagementPanel(2); setProductsManagementOpenPanel("remove"); }}>Delete</button>
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
                                <th>Product</th>
                                <th>Describtion</th>
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
                                    <td>{prod.pName}</td>
                                    <td>{prod.pDescribe}</td>
                                    <td>{prod.pStock}</td>
                                    <td>Rs. {prod.pPrice}/=</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
            <section id="productsManagementPanel" className="productsManagementPanel">
                <div className="addItemContainer" style={{ display: confirmPanelActive === true ? "none" : "flex" }}>
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
                                            <input type="text" name="pNameSearch" id="pNameSearch" placeholder="Select Product" list="product-options" value={productInput} onChange={handleProductSelect} />
                                            <datalist id="product-options">
                                                {products.map((prod) => (
                                                    <option key={prod.pId} value={prod.pName}></option>
                                                ))}
                                            </datalist>
                                        </div>
                                        <div>
                                            <input type="text" name="pName" id="pName" placeholder="Product Name" list="productOptions" value={pName} onChange={(e) => setPName(e.target.value)} required={productsManagementOpenPanel === "update" || productsManagementOpenPanel === "add"} disabled={productsManagementOpenPanel === "remove"} />
                                            <datalist id="productOptions">
                                                {products.map((prod) => (
                                                    <option key={prod.pId} value={prod.pName}></option>
                                                ))}
                                            </datalist>
                                        </div>
                                        <div>
                                            <input type="number" name="pStock" id="pStock" placeholder="Product Stock" value={pStock} onChange={(e) => setPStock(e.target.value === "" ? "" : Number(e.target.value))} required={productsManagementOpenPanel === "update" || productsManagementOpenPanel === "add"} disabled={productsManagementOpenPanel === "remove"} />
                                        </div>
                                        <div>
                                            <input type="number" name="pPrice" id="pPrice" placeholder="Product Price" value={pPrice} onChange={(e) => setPPrice(e.target.value === "" ? "" : Number(e.target.value))} required={productsManagementOpenPanel === "update" || productsManagementOpenPanel === "add"} disabled={productsManagementOpenPanel === "remove"} />
                                        </div>
                                        <div>
                                            <input type="text" name="pDescription" id="pDescription" placeholder="Product Description" value={pDescription} onChange={(e) => setPDescription(e.target.value)} required={productsManagementOpenPanel === "update" || productsManagementOpenPanel === "add"} disabled={productsManagementOpenPanel === "remove"} />
                                        </div>
                                        <div style={{ display: "inline-flex", gap: "8px", alignItems: "center" }}>
                                            <input list="category-options" placeholder="Select or type category..." value={categoryInput} onChange={(e) => setCategoryInput(e.target.value)} required={productsManagementOpenPanel === "update" || productsManagementOpenPanel === "add"} disabled={productsManagementOpenPanel === "remove"} />
                                            <datalist className="category-options" id="category-options">
                                                {categories.map((cat) => (
                                                    <option key={cat.categoryId} value={cat.categoryName} />
                                                ))}
                                            </datalist>
                                        </div>
                                        <div className="formOperateBtn">
                                            <div>
                                                <button id="formAdd" type="button" className="formBtn" onClick={(e) => handleOpenConfirm(e, "add")}>Add Product</button>
                                            </div>
                                            <div>
                                                <button id="formUpdate" type="button" className="formBtn" onClick={(e) => handleOpenConfirm(e, "update")}>Update Details</button>
                                            </div>
                                            <div>
                                                <button id="formRemove" type="button" className="formBtn" onClick={(e) => handleOpenConfirm(e, "remove")}>Remove Product</button>
                                            </div>
                                            <div>
                                                <button id="formCancel" type="button" className="formBtn fCancel" onClick={() => handleProductsManagementPanel(3)}>Cancel</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                <div className="confirmPanel" style={{ display: confirmPanelActive ? "flex" : "none" }}>
                    <div className="confirmContent">
                        <div className="confirmInfo" style={{ display: dbProcessStatus === 'waiting' ? "flex" : "none" }}>
                            <Image
                                src="/redAlert.svg"
                                alt="Red Alert"
                                width={200}
                                height={200}
                                loading="eager"
                                priority
                            />
                            <h3>Are You Sure !!!</h3>
                            <h4 style={{ display: formOperationBtnValue === "add" ? "block" : "none" }}>You want to add this product?</h4>
                            <h4 style={{ display: formOperationBtnValue === "update" ? "block" : "none" }}>You want to update this product?</h4>
                            <h4 style={{ display: formOperationBtnValue === "remove" ? "block" : "none" }}>You want to remove this product?</h4>
                        </div>
                        <div className="confirmInfo" style={{ display: dbProcessStatus === "success" || dbProcessStatus === "error" ? "flex" : "none" }}>
                            <Image
                                src={dbProcessStatus === "success" ? "/confirm.svg" : "/error.svg"}
                                alt={dbProcessStatus === "success" ? "Success" : "Error"}
                                width={200}
                                height={200}
                                loading="eager"
                                priority
                            />
                            <h3 style={{ display: dbProcessStatus === "success" ? "block" : "none", color: "green" }}>Done</h3>
                            <h3 style={{ display: dbProcessStatus === "error" ? "block" : "none", color: "red" }}>Failed</h3>
                            <h4 style={{ display: dbProcessStatus === "success" && formOperationBtnValue === "add" ? "block" : "none", color: "green" }}>
                                Added Product Successfully
                            </h4>
                            <h4 style={{ display: dbProcessStatus === "success" && formOperationBtnValue === "update" ? "block" : "none", color: "green" }}>
                                Updated Product Successfully
                            </h4>
                            <h4 style={{ display: dbProcessStatus === "success" && formOperationBtnValue === "remove" ? "block" : "none", color: "green" }}>
                                Removed Product Successfully
                            </h4>
                            <h4 style={{ display: dbProcessStatus === "error" ? "block" : "none", color: "red" }}>
                                Please Try Again Later: {errorMessage}
                            </h4>
                        </div>
                        <div className="confirmBtn" style={{ display: dbProcessStatus === "waiting" ? "flex" : "none" }}>
                            <div style={{ display: formOperationBtnValue === "add" ? "block" : "none" }}>
                                <button id="confirmYes" type="button" onClick={() => handleAddProduct()}>Add Product</button>
                            </div>
                            <div style={{ display: formOperationBtnValue === "update" ? "block" : "none" }}>
                                <button id="confirmYes" type="button" onClick={() => handleUpdateProduct()}>Update Product</button>
                            </div>
                            <div style={{ display: formOperationBtnValue === "remove" ? "block" : "none" }}>
                                <button id="confirmYes" type="button" onClick={() => handleRemoveProduct()}>Remove Product</button>
                            </div>
                            <div onClick={() => { setConfirmPanelActive(false); setFormOperationBtnValue(null); setDbProcessStatus(null); }}>
                                <button id="confirmCancel" type="button" className="confirmButtonCancel">Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}