export default function Overview(){
    return(
        <section className="overviewSection">
            <div className="salesDetails">
                <div className="totalProfit">
                    <div className="salesCards">
                        <div className="cardTopic">
                            <div className="indicator"></div>
                            <div className="detail">
                                <h2>Net Profit</h2>
                            </div>
                        </div>
                        <div className="cardData">
                            <h2>Rs. 450,000/=</h2>
                        </div>
                    </div>
                </div>
                <div className="monthlyProfit">
                    <div className="salesCards">
                        <div className="cardTopic">
                            <div className="indicator"></div>
                            <div className="detail">
                                <h2>This Month Profit</h2>
                            </div>
                        </div>
                        <div className="cardData">
                            <h2>Rs. 450,000/=</h2>
                        </div>
                    </div>
                </div>
                <div className="pendingOrders">
                    <div className="salesCards">
                        <div className="cardTopic">
                            <div className="indicator"></div>
                            <div className="detail">
                                <h2>Pending Orders</h2>
                            </div>
                        </div>
                        <div className="cardData">
                            <h2>25,000</h2>
                        </div>
                    </div>
                </div>
                <div className="closeOrders">
                    <div className="salesCards">
                        <div className="cardTopic">
                            <div className="indicator"></div>
                            <div className="detail">
                                <h2>Completed Orders</h2>
                            </div>
                        </div>
                        <div className="cardData">
                            <h2>65,000</h2>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
