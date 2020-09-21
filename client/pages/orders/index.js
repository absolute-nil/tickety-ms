import Link from 'next/link';
import { OrderStatus } from '@n19tickety/common';

const OrderIndex = ({ orders }) => {
  return (
    <ul className="list-group">
      {orders.map((order) => {
        return (
          <li key={order.id} className="list-group-item">
            {order.status === OrderStatus.AwaitingPayment ||
            order.status === OrderStatus.Created ? (
              <Link href="/orders/[orderId]" as={`orders/${order.id}`}>
                <a className="page-link">
                  {order.ticket.title} - {order.status}
                </a>
              </Link>
            ) : (
              <div className="card" style={{ padding: 7 }}>
                <span className="dark-link">
                  {order.ticket.title} - {order.status}
                </span>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
};

OrderIndex.getInitialProps = async (context, client) => {
  const { data } = await client.get('/api/orders');

  return { orders: data };
};

export default OrderIndex;
