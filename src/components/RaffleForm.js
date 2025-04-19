function RaffleForm() {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
        <h2 className="text-xl font-semibold mb-4">Participer à une Tombola CryptoGrind</h2>
        <form>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="name">
              Nom
            </label>
            <input
              type="text"
              id="name"
              className="w-full p-2 border rounded"
              placeholder="Votre nom"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full p-2 border rounded"
              placeholder="Votre email"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Participer
          </button>
        </form>
      </div>
    );
  }
  
  export default RaffleForm;