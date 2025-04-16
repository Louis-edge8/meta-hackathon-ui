"use client"

import TourPackageEditor from "@/app/components/tour-package-editor"
import { Button } from "@/components/ui/button"
import type { Location } from "@/lib/database.types"
import { Package } from "@/lib/services/search-packages"
import type { User } from "@supabase/auth-helpers-nextjs"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Loader2, Plus, Wand2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { DashboardHeader } from "./dashboard/dashboard-header"
import { InterestForm } from "./dashboard/interest-form"
import { InterestsList } from "./dashboard/interests-list"
import { SearchResults } from "./dashboard/search-results"
import { SearchResultsWrapper } from "./dashboard/search-results-wrapper"

export default function HomePage() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const [user, setUser] = useState<User | null>(null)
  const [locations, setLocations] = useState<Location[]>([])
  const [interests, setInterests] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [interestId, setInterestId] = useState<string | null>(null)
  const [searchResults, setSearchResults] = useState<Record<string, any[]>>({})
  const [interestLocations, setInterestLocations] = useState<Record<string, string>>({})
  const [packages, setPackages] = useState<Package[]>([])
  const [isPackagesLoading, setIsPackagesLoading] = useState(false)
  const [basePackages, setBasePackages] = useState<Package[]>([])
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<Package | undefined>(undefined)
  const [editorMode, setEditorMode] = useState<'add' | 'edit'>('add')

  // Fetch random packages from the database
  const fetchRandomPackages = async () => {
    try {
      setIsPackagesLoading(true)
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        throw new Error("User not authenticated")
      }

      // Fetch packages directly from Supabase
      const { data: packages, error } = await supabase
        .from('travel_packages')
        .select('*')
        .limit(20)  // Fetch more to allow for random selection

      if (error) {
        console.error('Error fetching packages from Supabase:', error)
        throw new Error('Failed to fetch packages from database')
      }

      if (!packages || packages.length === 0) {
        setBasePackages([])
        return
      }

      // Shuffle the packages and return a random subset
      const shuffled = [...packages].sort(() => 0.5 - Math.random())
      const randomPackages = shuffled.slice(0, Math.min(20, shuffled.length))

      setBasePackages(randomPackages || [])
    } catch (error) {
      console.error("Error fetching random packages:", error)
    } finally {
      setIsPackagesLoading(false)
    }
  }

  // Check auth and fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check auth
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

        if (authError || !authUser) {
          router.push("/login")
          return
        }

        setUser(authUser)

        // Fetch locations
        const { data: locationsData } = await supabase
          .from("locations")
          .select("*")
          .order("name")

        setLocations(locationsData || [])

        // Fetch interests
        const response = await fetch(`/api/interests?userId=${authUser.id}`)

        if (response.ok) {
          const data = await response.json()

          // Fetch locations for each interest if needed
          const interestsWithLocations = await Promise.all(
            data.interests.map(async (interest: any) => {
              if (interest.locations_id.length > 0) {
                const { data: locData } = await supabase
                  .from('locations')
                  .select('*')
                  .in('id', interest.locations_id)

                return {
                  ...interest,
                  locations: locData || []
                }
              }
              return {
                ...interest,
                locations: []
              }
            })
          )

          setInterests(interestsWithLocations)
        }

        // Fetch random packages
        fetchRandomPackages()
      } catch (error) {
        console.error("Error fetching initial data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [supabase, router])

  // Handle search
  const handleSearch = async (interest: any) => {
    if (!interest) return

    // Set the interest ID being searched
    setInterestId(interest.id)

    // Scroll to section 3 (results) immediately
    const resultsSection = document.getElementById('section-3')
    if (resultsSection) {
      resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        throw new Error("User not authenticated")
      }

      // Transform mock data to match expected Package format
      const mockPackages = [
        {
          "id": "deb27ab4-56d0-422e-a9a9-b5fcaed455f3",
          "title": "Ha Long Escape: 2-Day Cruise Adventure",
          "provider_id": "047d4c0e-7088-4a2a-aaca-7a8d32c90117",
          "location_id": "862d50a4-f172-4fc2-b2bc-9ba2eb45ae85",
          "price": 289.0,
          "duration_days": 2,
          "highlights": ["cruise", "cave", "local cuisine"],
          "description": "# 🚤 Ha Long Bay – *2-Day Cruise Adventure: Mystic Waters, Hidden Caves*\n\n**Duration:** 2 Days  \n**Trip Type:** Overnight cruise, soft adventure  \n**Ideal For:** Couples, photographers, weekend explorers  \n**Best Season:** October–April *(cool breeze, calm waters)*\n\n---\n\n## 🧭 Overview\n\nShort on time, but dreaming of Ha Long Bay? This 2-day overnight cruise offers a stunning getaway into **Vietnam's mythical seascape**. Glide past towering limestone cliffs, kayak into hidden lagoons, and dine beneath the stars. It's a short trip — but the memories will linger.\n\n---\n\n## 📅 Itinerary Breakdown\n\n### **Day 1: Cast Off & Cave Exploration**\n\n- **08:00** – Depart from **Hanoi** in a luxury limousine van *(Wi-Fi on board)*  \n- **12:00** – Arrive at the marina and board your **traditional wooden junk** cruise  \n- **13:00** – Enjoy a **fresh seafood lunch** while sailing through scenic formations like **Fighting Cock Islet** and **Dog Islet**  \n- **15:00** – Discover **Sung Sot Cave**, the bay’s largest cavern with natural light shows and stalactite formations  \n- **16:30** – Choose your adventure:\n  - 🚣‍♂️ **Kayak into Luon Cave**, a hidden grotto of emerald water  \n  - 🛶 Take a **bamboo boat ride** rowed by locals  \n- **18:00** – Return to the deck for a **Vietnamese cooking class** at sunset  \n- **19:30** – Dine on a **rooftop seafood BBQ** with wine and open-air views  \n- **21:00** – Optional activities: *squid fishing*, *movies*, or *stargazing*\n\n---\n\n### **Day 2: Sunrise, Tai Chi, and Ti Top Views**\n\n- **06:30** – Greet the morning with **Tai Chi on deck**, surrounded by rising karsts  \n- **07:30** – Light breakfast on board  \n- **08:30** – Explore **Ti Top Island**:\n  - 🧗‍♂️ Hike 400 steps for a **panoramic view of the bay**  \n  - 🏖 Relax on the sandy beach and enjoy a swim  \n- **10:00** – Light brunch and packing  \n- **11:30** – Disembark and transfer back to Hanoi, arriving around **15:00**\n\n---\n\n## 🚐 What’s Included\n\n- ✅ Hanoi ↔ Ha Long luxury van transfers (Wi-Fi included)  \n- ✅ Private cabin with en-suite bathroom  \n- ✅ All meals, activities, and entrance fees  \n- ✅ English-speaking cruise guide  \n- ✅ Kayak or bamboo boat activity\n\n---\n\n## 🧳 What to Pack\n\n- 👙 Swimwear  \n- 🩴 Sandals or flip-flops  \n- 📷 Camera + battery  \n- 🎒 Waterproof backpack\n\n---\n\n> *Even with only two days, you'll leave with a head full of misty peaks, and a heart full of calm.*",
          "image_url": "https://thesinhtour.com/wp-content/uploads/2023/11/Grand-Pioneers-Cruise-1.jpg",
          "interested_count": 14,
          "isAIGenerated": false
        },
        {
          "id": "6d661e81-22d8-4927-b471-758e7dd045d4",
          "title": "Limestone Dreams: 4-Day Immersive Retreat",
          "provider_id": "047d4c0e-7088-4a2a-aaca-7a8d32c90117",
          "location_id": "862d50a4-f172-4fc2-b2bc-9ba2eb45ae85",
          "price": 679.9,
          "duration_days": 4,
          "highlights": ["hiking", "bay", "cultural show"],
          "description": "# 🌄 Ha Long Bay – *Limestone Dreams: A 4-Day Immersive Retreat*\n\n**Duration:** 4 Days  \n**Trip Type:** Cruise, culture, nature retreat  \n**Ideal For:** Travelers seeking deeper connection with nature and people  \n**Best Season:** November–March *(cooler climate, fewer crowds)*\n\n---\n\n## 🧭 Overview\n\nStep into a slower rhythm. This 4-day journey offers the **essence of Ha Long** through its landscapes and local life. It blends peaceful cruises with onshore stays at eco-lodges, featuring village walks, folk arts, and forest trails. For those who want more than just views — this is the soul of the bay.\n\n---\n\n## 📅 Itinerary Breakdown\n\n### **Day 1: Cruise into the Bay**\n\n- **08:00** – Hotel pickup from **Hanoi**  \n- **12:00** – Welcome aboard your **Ha Long cruise**, check-in and safety briefing  \n- **13:30** – Feast on a **traditional Vietnamese lunch** as you sail into the heart of Ha Long Bay  \n- **15:00** – Visit **Sung Sot Cave**, filled with natural rock sculptures and light-filtered chambers  \n- **16:30** – Paddle or cruise around **Luon Cave**  \n- **19:00** – Join a **cooking workshop**, then enjoy a multi-course **Vietnamese dinner** on deck\n\n### **Day 2: Life Among Locals**\n\n- **06:30** – Wake up for Tai Chi and sunrise photos  \n- **08:00** – Cruise to **Vung Vieng Floating Village**: meet local fishermen and explore with bamboo boats  \n- **12:00** – Disembark and transfer to an **eco-lodge retreat** in a forest-fringed village  \n- **15:00** – Participate in hands-on activities: **make rice paper**, enjoy **herbal foot baths**  \n- **18:30** – **Cultural dinner** with a live performance of **folk music and dance**\n\n### **Day 3: Forest Trails & Hidden Hills**\n\n- **08:00** – Hike **Bai Tho Mountain** (Poem Mountain) for spectacular views of the bay  \n- **12:00** – Picnic in a forest clearing near a tranquil lake  \n- **15:00** – Optional cycling tour to a nearby village  \n- **18:00** – Dine with your hosts and unwind in hammocks under the stars\n\n### **Day 4: Local Farewells**\n\n- **07:00** – Morning walk in the fields and local market  \n- **08:30** – Light breakfast  \n- **10:00** – Transfer back to Ha Long City and then Hanoi\n\n---\n\n## 🚐 What’s Included\n\n- ✅ 1-night Ha Long cruise with activities  \n- ✅ 2-night eco-lodge with full board  \n- ✅ Roundtrip transfers from Hanoi  \n- ✅ Cave, village, and hiking experiences  \n- ✅ Cultural show, cooking class, kayaking\n\n---\n\n## 🧳 What to Pack\n\n- 👟 Walking shoes or hiking sandals  \n- 🧣 Lightweight long sleeves for temples and caves  \n- 📸 Camera or sketchbook  \n- 🧴 Bug spray & sunscreen\n\n---\n\n> *In these quiet corners of Ha Long, every step becomes a story.*",
          "image_url": "https://media.istockphoto.com/id/186977241/photo/floating-village-near-rock-islands-in-halong-bay.jpg?s=612x612&w=0&k=20&c=9OKlFCq3JJIKwe7KThPLf33NCczlwhzxuuNiaM-e2Qs=",
          "interested_count": 14,
          "isAIGenerated": true
        },
        {
          "id": "fdf3385d-7673-4f48-aa52-dfbae3fe7aab",
          "title": "Ha Long Highlights: 1-Day Scenic Tour",
          "provider_id": "047d4c0e-7088-4a2a-aaca-7a8d32c90117",
          "location_id": "862d50a4-f172-4fc2-b2bc-9ba2eb45ae85",
          "price": 165.5,
          "duration_days": 1,
          "highlights": ["photo spots", "beach", "speedboat"],
          "description": "# 🏖 Ha Long Bay – *1-Day Highlights: Iconic Views, Caves & Beach Bliss*\n\n**Duration:** 1 Day  \n**Trip Type:** Speedboat cruise, soft adventure, day tour  \n**Ideal For:** Time-strapped travelers, weekenders, families  \n**Best Season:** All year *(especially March–May & September–November)*\n\n---\n\n## 🧭 Overview\n\nPressed for time but still want to see the magic of Ha Long? This **full-day express tour** delivers a punch: cruise past signature islets, dive into a glowing cave, hike a viewpoint, and cool off with a beach swim — all in a single, smooth ride from Hanoi.\n\n---\n\n## 📅 Itinerary Breakdown\n\n### **07:00 – Pickup from Hanoi**\n- Air-conditioned van with comfortable seats and Wi-Fi\n\n### **10:00 – Welcome aboard**\n- Arrive at Tuan Chau Harbor and board a modern **day cruise**\n\n### **10:30 – Scenic Sailing**\n- Glide past **Fighting Cock Islet**, **Dog Islet**, and other iconic karsts  \n- Sip tea on the open deck while soaking in the views\n\n### **12:00 – Onboard Seafood Lunch**\n- Dine on fresh shrimp, clams, tofu with tomato, sautéed vegetables, and seasonal fruit\n\n### **13:30 – Cave and Island Adventure**\n- Walk through **Sung Sot Cave**, filled with massive chambers and light shafts  \n- Continue to **Ti Top Island**:\n  - 🧗‍♀️ Hike up for a panoramic vista  \n  - 🏊‍♂️ Or take a dip on the crescent-shaped beach\n\n### **15:30 – Cruise Return**\n- Relax and reflect with complimentary drinks as you head back to shore\n\n### **16:30 – Return to Hanoi**\n- Estimated arrival time: **19:30**\n\n---\n\n## 🚐 What’s Included\n\n- ✅ Roundtrip transfers from Hanoi  \n- ✅ Full-day modern cruise  \n- ✅ Seafood lunch  \n- ✅ Sung Sot Cave & Ti Top Island entrance fees  \n- ✅ English-speaking guide\n\n---\n\n## 🧳 What to Pack\n\n- 👕 Extra t-shirt  \n- 🩱 Swimwear & towel  \n- 📷 Camera or phone gimbal  \n- 🧢 Cap or hat\n\n---\n\n> *One day. A thousand photos. And a lifetime of awe.*",
          "image_url": "https://ehgtravel.com/wp-content/uploads/2018/04/halongbay03.jpg",
          "interested_count": 16,
          "isAIGenerated": true
        },
        {
          "id": "6f8a5582-60df-4b92-ba63-e60e66336f4b",
          "title": "Complete Ha Long Experience: 5-Day Ultimate Mix",
          "provider_id": "047d4c0e-7088-4a2a-aaca-7a8d32c90117",
          "location_id": "862d50a4-f172-4fc2-b2bc-9ba2eb45ae85",
          "price": 859.99,
          "duration_days": 5,
          "highlights": ["cruise", "cave", "cultural show", "beach", "local cuisine"],
          "description": "# 🌟 Ha Long Bay – *Complete Experience: The Best of All Worlds*\n\n**Duration:** 5 Days  \n**Trip Type:** Cruise, cultural immersion, beach getaway  \n**Ideal For:** Explorers, couples, photographers, and families  \n**Best Season:** October–April *(clear skies, vibrant landscapes)*\n\n---\n\n## 🧭 Overview\n\nIf you've ever dreamed of experiencing **Ha Long Bay in all its glory**, this is your dream itinerary. Combining the best of cruising, culture, adventure, and relaxation, this 5-day journey brings together hidden caves, floating villages, forested peaks, seafood feasts, and white-sand beaches. You'll explore at sea, on land, and through the stories of the locals.\n\n---\n\n## 📅 Itinerary Breakdown\n\n### **Day 1: Arrival & Cruise Welcome**\n- **07:30** – Transfer from **Hanoi** to Ha Long in luxury van  \n- **12:00** – Board your **premium cruise**: welcome drinks and check-in  \n- **13:00** – **Lunch on board** while sailing through iconic limestone formations  \n- **15:00** – Visit **Sung Sot Cave**, Ha Long's largest cave  \n- **17:00** – Enjoy a **cooking class** and sunset cocktails  \n- **19:00** – **Seafood BBQ dinner** under the stars\n\n### **Day 2: Nature & Local Life**\n- **06:30** – **Tai Chi session** on deck  \n- **08:00** – Visit **Cua Van floating village** by bamboo boat  \n- **14:00** – Disembark for an overnight stay at a **local eco-lodge**  \n- **18:00** – **Cultural dinner** with music and traditional games\n\n### **Day 3: Mountain & Beach Escape**\n- **09:00** – Hike **Bai Tho Mountain** for sweeping bay views  \n- **13:00** – Swim and relax on **Bai Chay Beach**  \n- **15:00** – Beach picnic with tropical fruits and seafood\n\n### **Day 4: Hidden Corners & Speedboat Thrills**\n- **08:30** – Speedboat to **Lan Ha Bay** and **Dark & Bright Cave**  \n- **11:00** – Kayak through **hidden lagoons**  \n- **17:00** – Return to cruise for sunset celebration and cocktail hour\n\n### **Day 5: Sunrise Farewell**\n- **06:00** – Sunrise cruise & light breakfast  \n- **08:00** – Stop at **Ti Top Island** for a final climb and swim  \n- **11:00** – Disembark and return to Hanoi by **15:30**\n\n---\n\n## 🚐 What's Included\n\n- ✅ All transfers from/to Hanoi  \n- ✅ 2 nights on cruise, 2 nights in eco-lodge  \n- ✅ All meals, entrance fees, and local guides  \n- ✅ Kayaking, bamboo boat, cooking class, cultural show  \n- ✅ Hiking, speedboat, Tai Chi, beach time\n\n---\n\n## 🧳 What to Pack\n\n- 🩱 Swimsuit & sandals  \n- 🧢 Hat & sunscreen  \n- 🎒 Waterproof bag  \n- 📷 Camera/drone *(check local restrictions)*\n\n---\n\n> *From sunrise on deck to starlit dinners, from hidden caves to mountain peaks — this is the Ha Long experience, complete and unforgettable.*",
          "image_url": "https://media-cdn-v2.laodong.vn/Storage/NewsPortal/2023/3/9/1155741/Du-Lich-Vinh-Ha-Long-01.jpg",
          "interested_count": 17,
          "isAIGenerated": true
        }
      ]

      // Replace previous results for this interest (not append)
      setSearchResults(prev => {
        const newResults = { ...prev }
        newResults[interest.id] = mockPackages
        return newResults
      })

      setInterestLocations(prev => {
        const prev2 = { ...prev }
        prev2[interest.id] = interest.locations_text
        return prev2
      })

    } catch (error) {
      console.error('Error searching packages:', error)
    } finally {
      // Ensure interestId is set to null after search completes to stop the spinner
      setTimeout(() => {
        setInterestId(null)
      }, 500)
    }
  }

  // Add scroll snap behavior
  useEffect(() => {
    const handleWheel = (e: Event) => {
      const wheelEvent = e as WheelEvent;
      const sections = document.querySelectorAll('section');
      let currentSection = sections[0];
      let currentSectionIndex = 0;

      // Find the current section in view
      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 50 && rect.bottom >= 50) {
          currentSection = section;
          currentSectionIndex = index;
        }
      });

      // Check if section content exceeds viewport height
      const sectionHeight = currentSection.scrollHeight;
      const viewportHeight = window.innerHeight;
      const sectionScrollTop = Math.abs(currentSection.getBoundingClientRect().top);

      // If scrolling down
      if (wheelEvent.deltaY > 0) {
        console.log("scrolling down", sectionHeight, sectionScrollTop, viewportHeight)
        // If we haven't reached the bottom of the section's content yet, let normal scrolling occur
        if (sectionHeight > viewportHeight && sectionScrollTop + viewportHeight < sectionHeight) {
          return;
        }

        // Otherwise prevent default and navigate to next section
        if (currentSectionIndex < sections.length - 1) {
          e.preventDefault();
          sections[currentSectionIndex + 1].scrollIntoView({ behavior: 'smooth' });
        }
      }
      // If scrolling up
      else if (wheelEvent.deltaY < 0) {
        // If we haven't reached the top of the section's content yet, let normal scrolling occur
        if (sectionScrollTop > 0) {
          return;
        }

        // Otherwise prevent default and navigate to previous section
        if (currentSectionIndex > 0) {
          e.preventDefault();
          sections[currentSectionIndex - 1].scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false } as AddEventListenerOptions);

    return () => {
      window.removeEventListener('wheel', handleWheel, { passive: false } as AddEventListenerOptions);
    };
  }, []);

  useEffect(() => {
    const handleSearchEvent = (event: CustomEvent) => {
      const { interest } = event.detail;
      if (interest) {
        handleSearch(interest);
      }
    };

    window.addEventListener('search-interest', handleSearchEvent as EventListener);

    return () => {
      window.removeEventListener('search-interest', handleSearchEvent as EventListener);
    };
  }, []);

  const handleEditPackage = (pkg: Package) => {
    setSelectedPackage(pkg)
    setEditorMode('edit')
    setIsEditorOpen(true)
  }

  const handleDeletePackage = async (packageId: string) => {
    try {
      const { error } = await supabase
        .from('travel_packages')
        .delete()
        .eq('id', packageId)

      if (error) throw error

      // Refresh packages list
      fetchRandomPackages()
      toast.success("Package deleted successfully")
    } catch (error) {
      console.error('Error deleting package:', error)
      toast.error("Failed to delete package")
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <main className="flex flex-col min-h-screen snap-y snap-mandatory overflow-y-auto">
      {/* Section 1: Navbar and Packages Display */}
      <section id="section-1" className="min-h-screen flex flex-col snap-start">
        {user && <DashboardHeader user={user} />}

        <div className="flex-1 container mx-auto p-6">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent py-2">
              My Travel Tours
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage or publish your travel tours. You can add, edit, or delete your tours.
            </p>
            <Button
              className="mt-4 bg-orange-500 hover:bg-orange-600 text-white"
              onClick={() => {
                setEditorMode('add')
                setSelectedPackage(undefined)
                setIsEditorOpen(true)
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Tour Package
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-4">
            {isPackagesLoading ? (
              <div className="col-span-4 flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="col-span-12 border-gray-200 dark:border-gray-700">
                <div className="min-h-[200px]">
                  <SearchResults
                    results={basePackages}
                    onEdit={handleEditPackage}
                    onDelete={handleDeletePackage}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Section 2: Interest Form */}
      <section id="section-2" className="min-h-screen flex flex-col snap-start">
        <div className="container mx-auto p-6 flex-1">
          <div className="text-center mb-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent py-2">
              Travel Tour Discovery
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Filter, find, or generate new travel tours using AI <Wand2 className="w-4 h-4 inline-block ml-1" />
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="border rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-medium mb-4">Find tour by Criterias</h3>
              {user && <InterestForm locations={locations || []} userId={user.id} />}
              <div className="mt-4">
                <p className="text-gray-500 italic">
                  Define criteria needed for new tours
                </p>
                <p className="text-gray-500 mt-2">
                  → Click generate to create new tours that match your parameters
                </p>
              </div>
            </div>

            <div className="border rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-medium mb-4">Recent Travel Interests</h3>

              {user && (
                <InterestsList
                  userId={user.id}
                  initialInterests={interests}
                  onSearch={handleSearch}
                  searchingInterestId={interestId}
                />
              )}

            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Search Results */}
      <section id="section-3" className="min-h-screen flex flex-col snap-start">
        <div className="container mx-auto p-6 flex-1 flex flex-col">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent py-2">
              Search Results
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Discover packages matching your criteria
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm flex-1 flex flex-col">
            {interestId && interests.find(i => i.id === interestId) ? (
              <SearchResultsWrapper
                results={searchResults}
                interestLocations={interestLocations}
                currentInterestId={interestId}
                interest={interests.find(i => i.id === interestId) || interests[0]}
              />
            ) : Object.keys(searchResults).length > 0 ? (
              <>
                {Object.keys(searchResults).map(id => {
                  const interest = interests.find(i => i.id === id);
                  if (!interest) return null;

                  return (
                    <div key={id} className="mb-4">
                      <SearchResultsWrapper
                        results={searchResults}
                        interestLocations={interestLocations}
                        currentInterestId={id}
                        interest={interest}
                      />
                    </div>
                  );
                })}
              </>
            ) : (
              <div className="text-center py-6 text-gray-500 flex-1 flex flex-col items-center justify-center">
                <p>Search for matching tours from the interest section above.</p>
                <p>Find relevant tours including an AI-generated recommendation.</p>
                <p className="mb-6">AI-generated tours will be highlighted with a "Created By AI" badge.</p>
                <Button
                  onClick={() => {
                    const section2 = document.getElementById('section-2');
                    section2?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Go to Interests
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>
      <TourPackageEditor
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        mode={editorMode}
        initialData={selectedPackage}
        locations={locations}
        onSuccess={fetchRandomPackages}
      />
    </main>
  )
}
