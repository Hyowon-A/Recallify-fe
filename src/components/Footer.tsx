export default function Footer() {
    return (
      <footer className="border-t bg-gray-50 py-6 text-center text-sm text-gray-500">
        <div className="flex flex-col md:flex-row items-center justify-between max-w-[1200px] mx-auto px-4">
          <p>© {new Date().getFullYear()} Recallify. All rights reserved.</p>
          <div className="flex gap-4 mt-2 md:mt-0">
            <a href="https://github.com/Hyowon-A/Recallify#" target="_blank" rel="noreferrer" className="hover:text-emerald-600">
              GitHub
            </a>
            <a href="" className="hover:text-emerald-600">
              About
            </a>
            <a href="" className="hover:text-emerald-600">
              Privacy
            </a>
          </div>
        </div>
      </footer>
    );
  }