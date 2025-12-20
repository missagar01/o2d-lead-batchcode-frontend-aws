function Footer() {
  return (
    <footer className="py-6 border-t bg-red-800 border-red-800 dark:bg-red-900 dark:border-red-900">
      <div className="container mx-auto flex justify-center items-center px-4">
        <p className="text-sm text-white">
          Powered By -{" "}
          <a
            href="https://botivate.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium hover:underline text-white hover:text-white/80"
          >
            Botivate
          </a>
        </p>
      </div>
    </footer>
  )
}

export default Footer
