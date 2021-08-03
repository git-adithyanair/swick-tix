const OrderIndex = (props) => {
  const ticketList = props.orders.map((order) => (
    <tr key={order.id}>
      <td>{order.ticket.title}</td>
      <td>{order.status}</td>
    </tr>
  ));
  return (
    <div>
      <h2>Your Orders</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>{ticketList}</tbody>
      </table>
    </div>
  );
};

OrderIndex.getInitialProps = async (context, client) => {
  const { data } = await client.get("/api/orders");

  return { orders: data };
};

export default OrderIndex;
