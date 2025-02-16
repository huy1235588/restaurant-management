'use client'

import "@/style/app.css";

export default function Waiter() {

    return (
        <section className="section">
            <h1 className="section-title">Phục vụ</h1>

            <form className="form" action="">
                <label htmlFor="inputTable">Table</label>
                <input id="inputTable" type="text" />

                <label htmlFor="inputItems">Items</label>
                <input id="inputItems" type="text" />

                <div className="submit-form">
                </div>
            </form>

            <h2>Trạng thái món ăn:</h2>
        </section>
    );
}
