"use client";

import Image from "next/image";
import Overview from "@/components/OverviewDashboard";
import Items from "@/components/ItemsDashboard";
import Orders from "@/components/OrdersDashboard";
import { checkDbConnection } from "@/lib/dbStatus";

import { useEffect, useState } from "react";

export default function Home() {
  const [active, setActive] = useState("overview");
  const [dbStatus, setDbStatus] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleClick(value:String) {
        document.querySelectorAll(".openPanelOptionsBtn").forEach((link) => {
            link.classList.remove("active");
        });

        if (value === "overview"){
          document.getElementById("overview-btn")!.classList.add("active");
          document.getElementById("items")!.style.display = "none";
          document.getElementById("orders")!.style.display = "none";
          document.getElementById("overview")!.style.display = "block";
        }

        else if (value === "items"){
          document.getElementById("items")!.style.display = "block";
          document.getElementById("items-btn")!.classList.add("active");
          document.getElementById("orders")!.style.display = "none"
          document.getElementById("overview")!.style.display = "none"
        }

        else if (value === "orders"){
          document.getElementById("orders")!.style.display = "flex";
          document.getElementById("orders-btn")!.classList.add("active");
          document.getElementById("items")!.style.display = "none";
          document.getElementById("overview")!.style.display = "none";
        }
    }

    useEffect(() => {
        let isMounted = true;

        const verifyDb = async () => {
            try {
                const result = await checkDbConnection();

                if (!isMounted) return;

                if (result.connected) {
                    setDbStatus(true);
                    setErrorMessage(null);
                } else {
                    setDbStatus(false);
                    setErrorMessage(result.message);
                }
            } catch (err: any) {
                if (!isMounted) return;
                setDbStatus(false);
                setErrorMessage(err.message || "Failed to check database connection.");
            }
        };

        verifyDb();

        return () => {
            isMounted = false;
        };
    }, []);

  return (
    <>
      {dbStatus === true && (
        <main className="defaultPage">
          <div className="leftPanel">
            <aside className="asidePanel">
                <div className="header">
                    <div className="iconHeader">
                      <Image
                        src="/sales-target.png"
                        width={80}
                        height={80}
                        loading="eager"
                        alt="Sales-Target"
                        priority
                      />
                    </div>
                    <h1>Sales Desk</h1>
                </div>
                <nav className="openPanel">
                    <div className="openPanelOptions">
                        <button id="overview-btn" className="openPanelOptionsBtn active" onClick={() => handleClick("overview")}>Overview</button>
                    </div>
                    <div className="openPanelOptions">
                        <button id="items-btn" className="openPanelOptionsBtn" onClick={() => handleClick("items")}>Items</button>
                    </div>
                    <div className="openPanelOptions">
                        <button id="orders-btn" className="openPanelOptionsBtn" onClick={() => handleClick("orders")}>Orders</button>
                    </div>
                </nav>
                <div className="footer">
                    <div className="closePanel">
                        <button>Sign Out</button>
                    </div>
                </div>
            </aside>
          </div>
          <div className="rightPanel">
            <nav className="topNavBar">
                <div className="notification">
                  <button>
                    <Image
                      src="/nonNotification.png"
                      width={40}
                      height={40}
                      loading="eager"
                      alt="No-Notifications"
                      className="nonNotifications"
                      priority
                    />
                    <Image
                      src="/notification.png"
                      width={50}
                      height={50}
                      loading="eager"
                      alt="Notifications"
                      className="notifications"
                      priority
                    />
                  </button>
                </div>
                <div className="userProfile">
                  <div className="icon">
                    <Image
                      src="/person.png"
                      width={30}
                      height={30}
                      loading="eager"
                      alt="User-Profile"
                      priority
                    />
                  </div>
                  <div className="infor">
                    <h2>Samithu Ranmira</h2>
                    <h3>Admin</h3>
                  </div>
                </div>
            </nav>
            <div className="dataBox">
              <div className="dataBoxContainer">
                <div className="overviewer" id="overview">
                  <Overview />
                </div>
                <div className="items" id="items">
                  <Items />
                </div>
                <div className="orders" id="orders">
                  <Orders />
                </div>
              </div>
            </div>
          </div>
        </main>
      )}
      {dbStatus === false && (
        <main className="dbErrorPanel">
          <div className="dbErrorPanelContainer">
            <div className="dbErrorHeader">
              <Image 
                src="/alert.gif"
                width={300}
                height={300}
                alt="Alert" 
                loading="eager"
                priority
              />
              <h1>Database Error</h1>
            </div>
            <div className="content">
              <p>Failed to connect to the database. Please try again later.</p>
              <p>Error Message: <span className="errorMsg">{errorMessage}</span></p>
            </div>
          </div>
        </main>
      )}
    </>
  );
}
