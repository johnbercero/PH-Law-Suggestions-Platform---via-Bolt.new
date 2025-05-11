export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer class="bg-gray-50 border-t border-gray-200">
      <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 class="text-base font-semibold text-gray-900">About</h3>
            <p class="mt-4 text-sm text-gray-600">
              The Philippines Citizen Suggestion Platform empowers citizens to contribute ideas for laws and regulations that can improve governance and public services.
            </p>
          </div>
          
          <div>
            <h3 class="text-base font-semibold text-gray-900">Quick Links</h3>
            <ul class="mt-4 space-y-2">
              <li>
                <a href="/about" class="text-sm text-primary-600 hover:text-primary-800">About the Platform</a>
              </li>
              <li>
                <a href="/faq" class="text-sm text-primary-600 hover:text-primary-800">FAQ</a>
              </li>
              <li>
                <a href="/contact" class="text-sm text-primary-600 hover:text-primary-800">Contact Us</a>
              </li>
              <li>
                <a href="https://congress.gov.ph" target="_blank" rel="noopener noreferrer" class="text-sm text-primary-600 hover:text-primary-800">Congress Website</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 class="text-base font-semibold text-gray-900">Legal</h3>
            <ul class="mt-4 space-y-2">
              <li>
                <a href="/terms" class="text-sm text-primary-600 hover:text-primary-800">Terms of Service</a>
              </li>
              <li>
                <a href="/privacy" class="text-sm text-primary-600 hover:text-primary-800">Privacy Policy</a>
              </li>
              <li>
                <a href="/cookies" class="text-sm text-primary-600 hover:text-primary-800">Cookie Policy</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div class="mt-8 pt-8 border-t border-gray-200">
          <p class="text-sm text-gray-500 text-center">
            &copy; {currentYear} Philippines Citizen Suggestion Platform. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}