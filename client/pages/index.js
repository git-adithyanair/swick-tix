import Link from "next/link";

const LandingPage = (props) => {
  const ticketList = props.tickets.map((ticket) => (
    <tr key={ticket.id}>
      <td>{ticket.title}</td>
      <td>${ticket.price}</td>
      <td>
        <Link href="/tickets/[ticketId]" as={`/tickets/${ticket.id}`}>
          <a>View ticket</a>
        </Link>
      </td>
    </tr>
  ));
  return (
    <div>
      <h2>
        {props.currentUser
          ? `You are signed in as '${props.currentUser.email}'.`
          : "You are not signed in."}
      </h2>

      <h1 style={{ marginTop: 30 }}>Available tickets</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th></th>
          </tr>
        </thead>
        <tbody>{ticketList}</tbody>
      </table>
    </div>
  );
};

LandingPage.getInitialProps = async (context, client, currentUser) => {
  const { data } = await client.get("/api/tickets");

  return { tickets: data };
};

export default LandingPage;
