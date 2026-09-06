import Header from '../components/Header';
import Footer from '../components/Footer';

export const metadata = {
  title: "Blog | Laya Balita",
  description: "Stories and experiences around Varkala from Laya Balita.",
};

export default function Page() {
  return (
    <>
      <Header active="Blog" />
      <div>
        <section className="site-hero overlay page-inside" style={{backgroundImage: 'url(/img/hero_2.jpg)'}}>
          <div className="container">
            <div className="row site-hero-inner justify-content-center align-items-center">
              <div className="col-md-10 text-center">
                <h1 className="heading" data-aos="fade-up">Blog</h1>
                <p className="sub-heading mb-5" data-aos="fade-up" data-aos-delay={100}>Events, news and activities in the hotel.</p>
              </div>
            </div>
            {/* <a href="#" class="scroll-down">Scroll Down</a> */}
          </div>
        </section>
        {/* END section */}
        <section className="section bg-light post">
          <div className="container">
            <div className="row">
              <div className="col-md-8">
                <div className="row mb-5">
                  <div className="col-md-6">
                    <div className="media media-custom d-block mb-4">
                      <a href="#" className="mb-4 d-block"><img src="/img/img_1.jpg" alt="Image placeholder" className="img-fluid" /></a>
                      <div className="media-body">
                        <span className="meta-post">February 26, 2018</span>
                        <h2 className="mt-0 mb-3"><a href="#">Drinks and Foods At Your Door</a></h2>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="media media-custom d-block mb-4">
                      <a href="#" className="mb-4 d-block"><img src="/img/img_2.jpg" alt="Image placeholder" className="img-fluid" /></a>
                      <div className="media-body">
                        <span className="meta-post">February 26, 2018</span>
                        <h2 className="mt-0 mb-3"><a href="#">Five Reasons to Stay at Villa Resort</a></h2>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="media media-custom d-block mb-4">
                      <a href="#" className="mb-4 d-block"><img src="/img/img_1.jpg" alt="Image placeholder" className="img-fluid" /></a>
                      <div className="media-body">
                        <span className="meta-post">February 26, 2018</span>
                        <h2 className="mt-0 mb-3"><a href="#">Drinks and Foods At Your Door</a></h2>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="media media-custom d-block mb-4">
                      <a href="#" className="mb-4 d-block"><img src="/img/img_2.jpg" alt="Image placeholder" className="img-fluid" /></a>
                      <div className="media-body">
                        <span className="meta-post">February 26, 2018</span>
                        <h2 className="mt-0 mb-3"><a href="#">Five Reasons to Stay at Villa Resort</a></h2>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="media media-custom d-block mb-4">
                      <a href="#" className="mb-4 d-block"><img src="/img/img_1.jpg" alt="Image placeholder" className="img-fluid" /></a>
                      <div className="media-body">
                        <span className="meta-post">February 26, 2018</span>
                        <h2 className="mt-0 mb-3"><a href="#">Drinks and Foods At Your Door</a></h2>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="media media-custom d-block mb-4">
                      <a href="#" className="mb-4 d-block"><img src="/img/img_2.jpg" alt="Image placeholder" className="img-fluid" /></a>
                      <div className="media-body">
                        <span className="meta-post">February 26, 2018</span>
                        <h2 className="mt-0 mb-3"><a href="#">Five Reasons to Stay at Villa Resort</a></h2>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-12">
                    <nav role="navigation">
                      <ul className="pagination custom-pagination pagination-lg">
                        <li className="page-item active">
                          <a className="page-link" href="#">1</a>
                        </li>
                        <li className="page-item ">
                          <a className="page-link " href="#">2</a>
                        </li>
                        <li className="page-item ">
                          <a className="page-link" href="#">3</a>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </div>
              </div>
              {/* END content */}
              <div className="col-md-4">
                <div className="row">
                  <div className="col-md-11 ml-auto">
                    <form action="#" className="sidebar-search">
                      <div className="form-group">
                        <span className="fa fa-search icon-search" />
                        <input type="text" className="form-control search-input" placeholder="Search..." />
                      </div>
                    </form>    
                    <div className="side-box">
                      <h2 className="heading">Popular Post</h2>
                      <ul className="post-list list-unstyled">
                        <li>
                          <a href="#" className="d-flex">
                            <span className="mr-3 image"><img src="/img/img_1.jpg" alt="Image placeholder" className="img-fluid" /></span>
                            <div>
                              <span className="meta">February 27, 2018</span>
                              <h3>Five Reasons to Stay at Villa Resort</h3>
                            </div>
                          </a>
                        </li>  
                        <li>
                          <a href="#" className="d-flex">
                            <span className="mr-3 image"><img src="/img/img_2.jpg" alt="Image placeholder" className="img-fluid" /></span>
                            <div>
                              <span className="meta">February 27, 2018</span>
                              <h3>Five Reasons to Stay at Villa Resort</h3>
                            </div>
                          </a>
                        </li>  
                        <li>
                          <a href="#" className="d-flex">
                            <span className="mr-3 image"><img src="/img/img_1.jpg" alt="Image placeholder" className="img-fluid" /></span>
                            <div>
                              <span className="meta">February 27, 2018</span>
                              <h3>Five Reasons to Stay at Villa Resort</h3>
                            </div>
                          </a>
                        </li>  
                        <li>
                          <a href="#" className="d-flex">
                            <span className="mr-3 image"><img src="/img/img_2.jpg" alt="Image placeholder" className="img-fluid" /></span>
                            <div>
                              <span className="meta">February 27, 2018</span>
                              <h3>Five Reasons to Stay at Villa Resort</h3>
                            </div>
                          </a>
                        </li>  
                        <li>
                          <a href="#" className="d-flex">
                            <span className="mr-3 image"><img src="/img/img_3.jpg" alt="Image placeholder" className="img-fluid" /></span>
                            <div>
                              <span className="meta">February 27, 2018</span>
                              <h3>Five Reasons to Stay at Villa Resort</h3>
                            </div>
                          </a>
                        </li>  
                      </ul>
                    </div>
                    {/* <div className="side-box google-review-box">
                      <div className="google-review-header">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" className="google-icon" />
                        <div>
                          <h2 className="heading mb-1">Google Reviews</h2>
                          <div className="rating">
                            ★★★★★ <span>4.9 / 5</span>
                          </div>
                        </div>
                      </div>
                      <p className="review-text">
                        Guests love the peaceful atmosphere, tropical aesthetics, warm hospitality, and perfect location near Varkala Cliff.
                      </p>
                      <div className="review-count">
                        Based on 120+ guest reviews
                      </div>
                      <a href="https://www.google.com/travel/search?ts=CAEaSAooEiYyJDB4M2IwNWVmN2RlNmM5MWRkMzoweDQ5Y2JhMGEwZWMyOGVkYRIcEhQKBwjqDxAFGBISBwjqDxAFGBMYATIECAAQACoHCgU6A0lOUg&qs=CAEyJ0Noa0kycDJLOXFEQnJzNEVHZzB2Wnk4eE1YbGpOM1EyYzJSaUVBRTgCQgkJ2o7CDgq6nARCCQnajsIOCrqcBA&utm_campaign=sharing&utm_medium=link_btn&utm_source=htls" className="btn btn-primary btn-sm mt-3">
                        View All Reviews
                      </a>
                    </div> */}
                    <div className="side-box">
                      <h2 className="heading">Categories</h2>
                      <ul className="post-categories list-unstyled">
                        <li><a href="#">Events <span className="count">(12)</span></a></li>
                        <li><a href="#">Resto bar <span className="count">(4)</span></a></li>
                        <li><a href="#">Celebration <span className="count">(23)</span></a></li>
                        <li><a href="#">Promos <span className="count">(8)</span></a></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
