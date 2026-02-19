// for admins
import Navbar from '../components/AdminNavbar'

const DashboardPage = () => {
  return (
    <div>
      <Navbar />
      <div style={{ padding: '2rem' }}>
        <h1>Dashboard</h1>
        <p>Scan activity charts will go here.</p>
      </div>
    </div>
  )
}

export default DashboardPage