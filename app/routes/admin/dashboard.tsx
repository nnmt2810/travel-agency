import {Header} from "../../../components";

const dashboard = () => {
  const user = { name: 'Minh Tuấn'}
  return (
    <main className="dashboard wrapper">
      <Header 
        title={`Welcome ${user?.name ?? 'Guest'} 👋`}
        description="Track activity, trends and popular destinations"
      />

      Dashboard Page Contents
    </main>
  )
}

export default dashboard