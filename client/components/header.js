import Link from "next/link";

const Header = ({ currentUser }) => {
  const links = [
    !currentUser && { label: "Sign Up", href: "/auth/signup" },
    !currentUser && { label: "Sign In", href: "/auth/signin" },
    currentUser && { label: "My Orders", href: "/orders" },
    currentUser && { label: "Sell a Ticket", href: "/tickets/new" },
    currentUser && { label: "Sign Out", href: "/auth/signout" },
  ]
    .filter((linkConfig) => linkConfig)
    .map(({ label, href }) => {
      return (
        <Link href={href} key={href}>
          <a className="nav-link">{label}</a>
        </Link>
      );
    });

  return (
    <nav className="navbar navbar-light bg-light " style={{ padding: 20 }}>
      <Link href="/">
        <a className="navbar-brand">SwickTix</a>
      </Link>
      <div className="d-flex justify-content-end">
        <ul className="nav d-flex align-items-center">{links}</ul>
      </div>
    </nav>
  );
};

export default Header;
