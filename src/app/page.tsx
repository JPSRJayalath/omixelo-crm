"use client";

import Image from "next/image";
import Overview from "@/components/OverviewDashboard";
import Items from "@/components/ItemsDashboard";
import Orders from "@/components/OrdersDashboard";
import { checkDbConnection } from "@/lib/dbStatus";
import { verifyPin } from "@/utils/decryption";
import { useEffect, useState } from "react";
import { useWebSocket } from "@/context/WebSocketContext";

export default function Home() {
  const [active, setActive] = useState("overview");
  const [dbStatus, setDbStatus] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [auth, setAuth] = useState(false);
  const [userName, setUserName] = useState("");
  const [pin, setPin] = useState("");
  const HASH_PIN = "f7ff15f15a788e9b89a9aadee4da8f40:a65fd5f168fd48e58b6f7f9dc16a45f11be4a406e9cb6dce7401d9ae09ce2667";
  const USERNAME = "Omixelo"

  const { dbStatus: wsDbStatus, dbErrorMessage: wsDbErrorMessage } = useWebSocket();

  // Real-time DB status via WebSocket (no polling required)
  useEffect(() => {
    if (wsDbStatus !== null) {
      setDbStatus(wsDbStatus);
      setErrorMessage(wsDbErrorMessage);
      if (wsDbStatus === false) {
        setAuth(false);
      }
    }
  }, [wsDbStatus, wsDbErrorMessage]);

  async function handleAuth(userName: string, pin: string){
    const isPinValid = await verifyPin(pin, HASH_PIN);
    if (userName === USERNAME && isPinValid){
      document.getElementById("userConfirm")!.style.display = "block";
      document.getElementById("user")!.style.display = "none";
      document.getElementById("personImg")!.style.border = "6px solid #00ff00";
      setTimeout(() => {
        setAuth(true);
      }, 1000)
    }
    else{
      setAuth(false);
      document.getElementById("userWrong")!.style.display = "block";
      document.getElementById("user")!.style.display = "none";
      document.getElementById("personImg")!.style.border = "6px solid #ff0000";
      document.getElementById("personImg")!.classList.add("shake");
      
      setTimeout(() => {
        document.getElementById("personImg")!.classList.remove("shake");
        document.getElementById("userWrong")!.style.display = "none";
        document.getElementById("user")!.style.display = "block";
        document.getElementById("personImg")!.style.border = "6px solid #ffffff";
      }, 1000)
    }
  }

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
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Enter") {
                void handleAuth(userName, pin);
            }
        }

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [userName, pin]);

  return (
    <>

      {/* Default Page */}
      {dbStatus === true && (
        <main>
          {auth === false && (
            <div className="passwordManager">
              <div className="glassFilter">
                <form action="">
                  <div className="inputForm">
                    <div id="personImg" className="personImg">
                      <div id="user" className="user">
                        <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 21C5 17.134 8.13401 14 12 14C15.866 14 19 17.134 19 21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div id="userWrong" className="userWrong">
                        <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 16L20 21M20 16L15 21M4 21C4 17.134 7.13401 14 11 14M15 7C15 9.20914 13.2091 11 11 11C8.79086 11 7 9.20914 7 7C7 4.79086 8.79086 3 11 3C13.2091 3 15 4.79086 15 7Z" stroke="#ff0000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div id="userConfirm" className="userConfirm">
                        <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 19.2857L15.8 21L20 17M4 21C4 17.134 7.13401 14 11 14C12.4872 14 13.8662 14.4638 15 15.2547M15 7C15 9.20914 13.2091 11 11 11C8.79086 11 7 9.20914 7 7C7 4.79086 8.79086 3 11 3C13.2091 3 15 4.79086 15 7Z" stroke="#00ff00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                    <div className="userPassForm">
                      <div className="username">
                        <label htmlFor="username">Username</label>
                        <input type="text" id="username" onChange={(e) => setUserName(e.target.value)} required/>
                      </div>
                      <div className="password">
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" onChange={(e) => setPin(e.target.value)} required/>
                      </div>
                    </div>
                  </div>
                  <div className="formControl">
                    <button type="button" onClick={() => handleAuth(userName, pin)}>Sign In</button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {auth === true && (
            <div className="defaultPage" style={{display: auth ? "grid" : "none"}}>
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
                            <button type="button" onClick={() => setAuth(false)}>Sign Out</button>
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
                        <h2>Omixelo</h2>
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
            </div>
          )}
        </main>
      )}

      {/* Database Connection Error Panel */}
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
