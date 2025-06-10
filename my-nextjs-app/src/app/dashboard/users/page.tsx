import UserTable from '@/components/dashboard/UserTable'

export default function UsersPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">User Management</h2>
      <UserTable />
    </div>
  )
}