export default function LoadingCard({ message = "Analyzing URL for threats..." }) {
  return (
    <div className="card loading">
      <div className="spinner" />
      <p>{message}</p>
    </div>
  );
}
